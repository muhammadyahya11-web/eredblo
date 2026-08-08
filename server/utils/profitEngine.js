import Investment from '../models/Investment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

let schedulerInterval = null;


// =====================================
// Distribute Investment Profits
// TEST MODE: 1 MINUTE PROFIT
// =====================================

const distributeProfits = async () => {

  try {

    const activeInvestments =
      await Investment.find({
        status: 'active'
      })
      .populate('plan', 'name');


    const now = new Date();

    let updatedCount = 0;



    for (const investment of activeInvestments) {


      try {


        const userId = investment.user;


        if (!userId) {
          console.warn(
            `[ProfitEngine] Missing user ${investment._id}`
          );
          continue;
        }



        // =====================================
        // MATURITY CHECK
        // =====================================

        if (now >= investment.endDate) {


          investment.status = 'completed';


          const user =
            await User.findById(userId);



          if (user) {


            const remainingProfit = Math.max(
              0,
              investment.totalReturn -
              investment.amount -
              (investment.profitEarned || 0)
            );



            const maturityAmount =
              investment.amount +
              remainingProfit;



            user.totalBalance =
              (user.totalBalance || 0)
              + maturityAmount;



            user.totalEarnings =
              (user.totalEarnings || 0)
              + remainingProfit;



            await user.save();




            await Transaction.create({

              user:user._id,

              type:'Profit',

              amount:maturityAmount,

              isPositive:true,

              status:'Approved',

              description:
              `Investment matured - ${investment.plan?.name || 'Plan'}`,

              referenceId:investment._id

            });




            await Notification.create({

              user:user._id,

              title:'Investment Matured',

              message:
              `Investment completed. PKR ${maturityAmount.toLocaleString()} added.`,

              type:'Profit',

              isImportant:true

            });


          }


          await investment.save();

          updatedCount++;

          continue;

        }




        // =====================================
        // TEST PROFIT EVERY 1 MINUTE
        // =====================================


        const lastAdded =
          investment.lastProfitAddedAt ||
          investment.startDate;



        const minutesSinceLastProfit =
          (now - new Date(lastAdded))
          /
          (1000 * 60 *60);



        if(minutesSinceLastProfit >= 1){



          const missedMinutes =
            Math.floor(minutesSinceLastProfit);



          const profitToAdd =
            investment.dailyProfit *
            missedMinutes;




          investment.profitEarned =
            (investment.profitEarned || 0)
            +
            profitToAdd;




          // exact minute update
          investment.lastProfitAddedAt =
            new Date(
              new Date(lastAdded).getTime()
              +
              missedMinutes * 60 * 1000
            );





          const user =
            await User.findById(userId);



          if(user){



            user.totalBalance =
              (user.totalBalance || 0)
              +
              profitToAdd;



            user.totalEarnings =
              (user.totalEarnings || 0)
              +
              profitToAdd;



            user.todayEarnings =
              (user.todayEarnings || 0)
              +
              profitToAdd;



            await user.save();





            await Transaction.create({

              user:user._id,

              type:'Profit',

              amount:profitToAdd,

              isPositive:true,

              status:'Approved',


              description:
              `Testing profit - ${investment.plan?.name || 'Investment'}`,


              referenceId:
              investment._id

            });






            await Notification.create({

              user:user._id,

              title:'Profit Added',

              message:
              `PKR ${profitToAdd.toLocaleString()} profit added.`,

              type:'Profit',

              isImportant:false

            });




            console.log(
              `[ProfitEngine] ${profitToAdd} profit added to ${user._id}`
            );


          }




          await investment.save();


          updatedCount++;


        }



      }
      catch(error){

        console.error(
          `Investment Error ${investment._id}:`,
          error.message
        );

      }


    }




    if(updatedCount > 0){

      console.log(
        `[ProfitEngine] Updated ${updatedCount} investments`
      );

    }



    return {

      updatedCount,

      processedAt:now.toISOString()

    };



  }
  catch(error){


    console.error(
      '[ProfitEngine Error]',
      error.message
    );


    return {

      updatedCount:0,

      error:error.message

    };


  }


};





// =====================================
// START TEST SCHEDULER
// =====================================

const startProfitScheduler = () => {


  if(schedulerInterval){

    console.log(
      '[ProfitEngine] Already running'
    );

    return;

  }



  console.log(
    '[ProfitEngine] Test Scheduler Started'
  );



  distributeProfits();



  // every 10 seconds check
  schedulerInterval =
    setInterval(
      distributeProfits,
      10 * 1000
    );


};





// =====================================
// STOP SCHEDULER
// =====================================

const stopProfitScheduler = () => {


  if(schedulerInterval){


    clearInterval(
      schedulerInterval
    );


    schedulerInterval=null;



    console.log(
      '[ProfitEngine] Scheduler stopped'
    );


  }


};





process.on(
  'SIGINT',
  ()=>{
    stopProfitScheduler();
    process.exit(0);
  }
);



process.on(
  'SIGTERM',
  ()=>{
    stopProfitScheduler();
    process.exit(0);
  }
);





export {
  distributeProfits,
  startProfitScheduler,
  stopProfitScheduler
};