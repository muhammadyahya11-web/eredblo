import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

let schedulerInterval = null;


// ===============================
// Distribute Investment Profits
// ===============================
const distributeProfits = async () => {

  try {

    // Get all active investments
    const activeInvestments = await Investment.find({ status: 'active' })
      .populate('plan', 'name');


    const now = new Date();
    let updatedCount = 0;


    for (const investment of activeInvestments) {

      try {

        const userId = investment.user;


        // If investment has no user
        if (!userId) {
          console.warn(
            `[ProfitEngine] Missing user for investment ${investment._id}`
          );
          continue;
        }



        // =====================================
        // Investment Maturity Check
        // =====================================

        if (now >= investment.endDate) {


          investment.status = 'completed';


          const user = await User.findById(userId);


          if (user) {


            // Remaining profit calculation
            // Daily paid profit is excluded
            const remainingProfit = Math.max(
              0,
              investment.totalReturn -
              investment.amount -
              (investment.profitEarned || 0)
            );


            const maturityPayout =
              investment.amount + remainingProfit;



            // Add remaining amount to user balance
            user.totalBalance =
              (user.totalBalance || 0) + maturityPayout;


            user.totalEarnings =
              (user.totalEarnings || 0) + remainingProfit;


            user.todayEarnings =
              (user.todayEarnings || 0) + remainingProfit;



            await user.save();



            // Save maturity transaction
            await Transaction.create({

              user: user._id,
              type: 'Profit',
              amount: remainingProfit,
              isPositive: true,
              status: 'Approved',

              description:
                `Investment matured - ${investment.plan?.name || 'Plan'}`,

              referenceId: investment._id

            });



            // Notification
            await Notification.create({

              user: user._id,

              title: 'Investment Matured',

              message:
                `Your investment matured. PKR ${maturityPayout.toLocaleString()} added to your balance.`,

              type: 'Profit',

              isImportant: true

            });

          }



          await investment.save();

          updatedCount++;

          continue;

        }




        // =====================================
        // Daily Profit Calculation
        // =====================================


        const lastAdded =
          investment.lastProfitAddedAt ||
          investment.startDate;



        // Convert milliseconds into hours
        const hoursSinceLastProfit =
          (now - new Date(lastAdded)) /
          (1000 * 60 * 60);



        // ================================
        // TESTING TIME
        // 0.01 hours = around 36 seconds
        //
        // Production:
        // change 0.01 to 24
        // ================================

        if (hoursSinceLastProfit >= 0.01) {



          // Testing: give one day profit
          const profitToAdd =
            investment.dailyProfit;



          // Save profit history
          investment.profitEarned =
            (investment.profitEarned || 0)
            + profitToAdd;



          // Update last profit time
          investment.lastProfitAddedAt =
            new Date();



          const user =
            await User.findById(userId);



          if (user) {



            // Add profit to wallet
            user.todayEarnings =
              (user.todayEarnings || 0)
              + profitToAdd;


            user.totalEarnings =
              (user.totalEarnings || 0)
              + profitToAdd;


            user.totalBalance =
              (user.totalBalance || 0)
              + profitToAdd;



            await user.save();




            // Create transaction
            await Transaction.create({

              user: user._id,

              type: 'Profit',

              amount: profitToAdd,

              isPositive: true,

              status: 'Approved',


              description:
                `Daily profit - ${investment.plan?.name || 'Investment'}`,


              referenceId:
                investment._id

            });





            // Notification
            await Notification.create({

              user: user._id,

              title: 'Daily Profit Added',

              message:
                `You received PKR ${profitToAdd.toLocaleString()} as daily profit.`,

              type: 'Profit',

              isImportant: false

            });



            console.log(
              `[ProfitEngine] Profit ${profitToAdd} added to user ${user._id}`
            );

          }




          await investment.save();


          updatedCount++;


        }



      } catch (investmentError) {


        console.error(
          `Error processing investment ${investment._id}:`,
          investmentError.message
        );


      }

    }



    if (updatedCount > 0) {

      console.log(
        `[ProfitEngine] Updated ${updatedCount} investments at ${now.toISOString()}`
      );

    }



    return {

      updatedCount,

      processedAt: now.toISOString()

    };



  } catch (error) {


    console.error(
      '[ProfitEngine] Error:',
      error.message
    );


    return {

      updatedCount: 0,

      error: error.message

    };


  }

};





// =================================
// Start Scheduler
// =================================

const startProfitScheduler = () => {


  console.log(
    '[ProfitEngine] Scheduler started'
  );



  // Run immediately
  distributeProfits();



  // TESTING:
  // Every 10 seconds
  schedulerInterval =
    setInterval(
      distributeProfits,
      10000
    );



  // Production:
  // setInterval(distributeProfits, 60 * 60 * 1000)

};





// =================================
// Stop Scheduler
// =================================

const stopProfitScheduler = () => {


  if (schedulerInterval) {


    clearInterval(schedulerInterval);


    schedulerInterval = null;


    console.log(
      '[ProfitEngine] Scheduler stopped'
    );


  }

};





process.on('SIGINT', () => {

  stopProfitScheduler();

  process.exit(0);

});



process.on('SIGTERM', () => {

  stopProfitScheduler();

  process.exit(0);

});





export {
  distributeProfits,
  startProfitScheduler,
  stopProfitScheduler
};