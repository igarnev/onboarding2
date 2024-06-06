import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { Connector, useAccount, useBalance } from "wagmi";
import { writeContract, watchContractEvent } from "@wagmi/core";
import { parseUnits } from "ethers";
import { Button, TextField } from "@mui/material";

import { QuizBasicInfo } from "../../models/Quiz";

import { QUIZ_GAME_ABI } from "../../utils/abi/QuizGame";

import { config } from "../../config";

import "./AnswerQuizQuestion.scss";

interface AnswerQuizQuestionProps {
  readonly activeQuiz: QuizBasicInfo;
  readonly setIsLoading: Dispatch<SetStateAction<boolean>>;
  readonly connector: Connector;
  readonly setModalProps: Dispatch<
    SetStateAction<{ headerText: string; contentText: string }>
  >;
  readonly fetchAllQuizzes: () => void;
}

export const AnswerQuizQuestion = ({
  activeQuiz,
  connector,
  setIsLoading,
  setModalProps,
  fetchAllQuizzes,
}: AnswerQuizQuestionProps) => {
  const { address } = useAccount();

  const [answer, setAnswer] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const userBalance = (useBalance({ address }).data as any)?.formatted;

  const clearAnswerQuizForm = () => {
    setAnswer("");
    setBetAmount("");
  };

  const guessAnswer = async () => {
    try {
      if (!activeQuiz?.address) {
        return;
      }
      handleAnswerQuestion();
    } catch (error: any) {
      setModalProps({
        headerText: "An error occurred!",
        contentText: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = async () => {
    try {
      setIsLoading(true);

      await writeContract(config, {
        abi: QUIZ_GAME_ABI,
        address: activeQuiz?.address,
        functionName: "guessAnswer",
        args: [answer],
        value: BigInt(parseUnits(betAmount, "ether")),
        connector,
        account: address,
      });

      handleAnswerQuestionListening();
    } catch (error: any) {
      setIsLoading(false);
      clearAnswerQuizForm();
      setModalProps({
        headerText: "An error has occurred",
        contentText: error.message,
      });
    }
  };

  const handleAnswerQuestionListening = () =>
    watchContractEvent(config, {
      address: activeQuiz?.address,
      abi: QUIZ_GAME_ABI,
      eventName: "AnswerGuessedCorrectly",
      onLogs(logs: any) {
        setModalProps({
          headerText: "Congrats you win! You win:",
          contentText: `${logs[0].args.winnedPrize} WEI`,
        });

        fetchAllQuizzes();
        clearAnswerQuizForm();
        setIsLoading(false);
      },
    });

  const handleSubmitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    guessAnswer();
  };

  const handleBetAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const newValue = inputValue.replace(/[^0-9.]/g, "");

    const parts = newValue.split(".");
    if (parts.length > 2) {
      setBetAmount(parts[0] + "." + parts[1]);
    } else {
      setBetAmount(newValue);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmitAnswer} className="game-container">
        <div>{activeQuiz.question}</div>

        <TextField
          id="answer"
          label="Answer here"
          variant="outlined"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          sx={{ width: "15rem" }}
        />

        <TextField
          id="betAmount"
          label="$ETH to bet"
          type="text"
          value={betAmount}
          variant="outlined"
          onChange={handleBetAmountChange}
          sx={{ width: "15rem" }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ width: "10rem" }}
          disabled={betAmount > userBalance || !betAmount || !answer}
        >
          Enter
        </Button>
        {betAmount > userBalance && (
          <span className="error-message">Not enough balance</span>
        )}
      </form>
    </>
  );
};
