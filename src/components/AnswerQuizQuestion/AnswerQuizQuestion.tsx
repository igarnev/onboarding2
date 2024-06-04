import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Connector, useAccount } from "wagmi";
import { writeContract, watchContractEvent } from "@wagmi/core";
import { Button, TextField } from "@mui/material";

import { QuizBasicInfo } from "../../models/Quiz";

import { QUIZ_GAME_ABI } from "../../utils/abi/QuizGame";

import { config } from "../../config";

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
  const [betAmount, setBetAmount] = useState(0);

  const clearAnswerQuizForm = () => {
    setAnswer("");
    setBetAmount(0);
  };

  const guessAnswer = async () => {
    try {
      setIsLoading(true);

      if (!activeQuiz?.address) {
        return;
      }

      handleAnswerQuestion();
      handleAnswerQuestionListening();
    } catch (error: any) {
      setModalProps({
        headerText: "An error occurred!",
        contentText: error.message,
      });

      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = () =>
    writeContract(config, {
      abi: QUIZ_GAME_ABI,
      address: activeQuiz?.address,
      functionName: "guessAnswer",
      args: [answer],
      value: BigInt(betAmount),
      connector,
      account: address,
    });

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
      },
    });

  const handleSubmitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    guessAnswer();
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
          label="$WEI to bet"
          type="number"
          variant="outlined"
          value={betAmount}
          onChange={(event) => setBetAmount(+event.target.value)}
          sx={{ width: "15rem" }}
        />
        <Button type="submit" variant="contained" sx={{ width: "10rem" }}>
          Enter
        </Button>
      </form>
    </>
  );
};
