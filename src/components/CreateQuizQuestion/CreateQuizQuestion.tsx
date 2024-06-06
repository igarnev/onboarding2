import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { Button, TextField } from "@mui/material";

import { Connector, useAccount } from "wagmi";
import { writeContract, watchContractEvent } from "@wagmi/core";

import { config } from "../../config";

import { QUIZ_GAME_FACTORY_ABI } from "../../utils/abi/QuizGameFactory";

interface CreateQuizQuestionProps {
  readonly setIsLoading: Dispatch<SetStateAction<boolean>>;
  readonly connector: Connector;
  readonly setModalProps: Dispatch<
    SetStateAction<{ headerText: string; contentText: string }>
  >;
  readonly fetchAllQuizzes: () => void;
}
export const CreateQuizQuestion = ({
  connector,
  setIsLoading,
  setModalProps,
  fetchAllQuizzes,
}: CreateQuizQuestionProps) => {
  const { address } = useAccount();

  const [question, setQuestion] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionSalt, setQuestionSalt] = useState("");

  const clearCreateQuizForm = () => {
    setQuestion("");
    setQuestionAnswer("");
    setQuestionSalt("");
  };

  const createQuizQuestion = async () => {
    try {
      handleCreateQuiz();
    } catch (error: any) {
      setModalProps({
        headerText: "An error has occurred",
        contentText: error.message,
      });
    }
  };

  const handleCreateQuiz = async () => {
    setIsLoading(true);

    try {
      await writeContract(config, {
        abi: QUIZ_GAME_FACTORY_ABI,
        address: import.meta.env.FACTORY_CONTRACT_ADDRESS,
        functionName: "createQuizGame",
        args: [question, questionAnswer, questionSalt],
        value: BigInt(6),
        connector,
        account: address,
      });
      handleQuizCreationListening();
    } catch (error: any) {
      setIsLoading(false);
      clearCreateQuizForm();
      setModalProps({
        headerText: "An error has occurred",
        contentText: error.message,
      });
    }
  };

  const handleQuizCreationListening = () =>
    watchContractEvent(config, {
      address: import.meta.env.FACTORY_CONTRACT_ADDRESS,
      abi: QUIZ_GAME_FACTORY_ABI,
      eventName: "QuizGameCreated",
      onLogs() {
        fetchAllQuizzes();
        clearCreateQuizForm();
        setIsLoading(false);
      },
    });

  const handleCreateQuizQuestion = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    createQuizQuestion();
  };

  return (
    <>
      <form onSubmit={handleCreateQuizQuestion} className="game-container">
        <div>Quiz Question Form</div>

        <TextField
          id="question"
          label="Add your question"
          variant="outlined"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          sx={{ width: "15rem" }}
        />
        <TextField
          id="questionAnswer"
          label="Add your question sanswer"
          variant="outlined"
          value={questionAnswer}
          onChange={(event) => setQuestionAnswer(event.target.value)}
          sx={{ width: "15rem" }}
        />

        <TextField
          id="salt"
          label="Add your secret salt"
          variant="outlined"
          value={questionSalt}
          onChange={(event) => setQuestionSalt(event.target.value)}
          sx={{ width: "15rem" }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{ width: "10rem" }}
          disabled={!question || !questionAnswer || !questionSalt}
        >
          Enter
        </Button>
      </form>
    </>
  );
};
