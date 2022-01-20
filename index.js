import fetch from "node-fetch";
import {Keypair} from "@solana/web3.js"
import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { getReturnAmount, randomNumber, totalAmtToBePaid } from "./helper.js"
import { airDropSol, getWalletBalance, transferSOL, createConnection } from "./solana.js"

const init = () => {
    console.log(
      chalk.green(
        figlet.textSync("SOL Stake", {
          font: "Ghost",
          horizontalLayout: "default",
          verticalLayout: "default"
        })
      )
    );
  };

  const askQuestions = (maxBidding) => {
    console.log(
      chalk.yellow(`The max bidding ammount is ${maxBidding} SOL here`)
    );
  
    const questions = [
      {
        name: "stake",
        type: "input",
        message: "What is the amount of SOL you want to stake?",
        validate: (value)=>{
          if(isNaN(value)){
            return "Please provide a number";
          }
          else if(value <= 0){
            return "Please provide value greater than 0";
          }
          else if(value > maxBidding){
            return `Please provide value lower than ${maxBidding}`;
          }
          return true;
        }
      },
      {
        type: "list",
        name: "ratio",
        message: "What is the ratio of your staking?",
        choices: ["1:1.15", "1:1.25", "1:1.5", "1:2", "1:2.5"],
        filter: (value)=>{
          const ratio = value.split(':')[1];
          return ratio;
        }
      }
    ];
    return inquirer.prompt(questions);
  };

  const askGuess = (min, max) => {
    const questions = [
      {
        name: "guessNumber",
        type: "input",
        message: `Guess a random number from ${min} to ${max} (both ${min}, ${max} included)`,
        validate: (value)=>{
          if(isNaN(value)){
            return "Please provide a number";
          }
          else if(value < min){
            return `Please provide value greater than ${min}`;
          }
          else if(value > max){
            return `Please provide value lower than ${max}`;
          }
          return true;
        }
      }
    ];
    return inquirer.prompt(questions);
  };
  
const showWaletBalance = async (walet, name)=>{
  const balance = await getWalletBalance(walet);
  console.log(`${name} walet balane: ${balance}. Walet address: ${walet}`);
};

const gameExecution = async ()=>{
    const MAX_BIDDDING_SOL = 2.5;

    const userWallet=Keypair.generate();
    const gameWallet=Keypair.generate();

    await airDropSol(userWallet.publicKey, 3);  
    
    init();
    await showWaletBalance(userWallet.publicKey, "User");
    await showWaletBalance(gameWallet.publicKey, "Game");

    const response = await askQuestions(MAX_BIDDDING_SOL);

    const amountToBePaid = totalAmtToBePaid(response.stake);
    console.log(chalk.gray(`You have to pay`, chalk.green(amountToBePaid), `to move forward`));

    const reward = getReturnAmount(response.ratio, response.stake);

    console.log(chalk.green(`You will get ${reward} if guessing the number correctly`));
    const min = 1;
    const max = 5;
    const guess = await askGuess(min, max);

    const sign = await transferSOL(userWallet.publicKey, gameWallet.publicKey, userWallet.secretKey, amountToBePaid);
    console.log(chalk.gray(`Signature of payment for playing the game`, chalk.green(sign)));

    const randNumber = randomNumber();
    if(guess.guessNumber === randNumber || true){
      console.log(chalk.green(`Your guess is absolutely corectly`));
      await airDropSol(gameWallet.publicKey, reward);
      const prizeSign = await transferSOL(gameWallet.publicKey, userWallet.publicKey, gameWallet.secretKey, reward);
      console.log(chalk.gray(`Here is the price signature`, chalk.green(prizeSign)));
    }else{
      console.log(chalk.yellow("Better luck next time"));
    }

    await showWaletBalance(userWallet.publicKey, "User");
    await showWaletBalance(gameWallet.publicKey, "Game");
}

gameExecution();


