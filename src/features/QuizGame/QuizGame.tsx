import { FormEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract, watchContractEvent } from "@wagmi/core";
import { Button, TextField } from "@mui/material";

import { config } from "../../config";

import { QUIZ_GAME_FACTORY_ABI } from "../../utils/abi/QuizGameFactory";
import { QUIZ_GAME_ABI } from "../../utils/abi/QuizGame";

import { QuizBasicInfo } from "../../models/Quiz";
import { ContractAddress } from "../../models/ContractAddress";

import "./QuizGame.scss";
import InfoModal from "../../components/Modal/InfoModal";
import { parseGwei } from "viem";

const FACTORY_CONTRACT_ADDRESS = "0x3132b5E0B22c52474fE6b5505195c2085Db257F6";

interface WinnerProps {
  answer: string;
  winnerAddress: ContractAddress;
}

export const QuizGameComponent = () => {
  const { address } = useAccount();

  const [quizzes, setQuizzes] = useState<QuizBasicInfo[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizBasicInfo>();
  const [answer, setAnswer] = useState("");
  const [betAmount, setBetAmount] = useState(0);
  const [winner, setWinner] = useState<WinnerProps>();
  const [isCreatingQuizQuestion, setIsCreatingQuizQuestion] =
    useState<boolean>(false);
  const [question, setQuestion] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [questionSalt, setQuestionSalt] = useState("");

  useEffect(() => {
    if (address) {
      fetchAllQuizzes();
    }
  }, [address]);

  const fetchAllQuizzes = async () => {
    try {
      const result = (await readContract(config, {
        abi: QUIZ_GAME_FACTORY_ABI,
        address: FACTORY_CONTRACT_ADDRESS,
        functionName: "getQuizGames",
      })) as ContractAddress[];

      const fetchedQuizzes: QuizBasicInfo[] = [];

      for (const quizAddress of result) {
        const question = (await fetchSingleData(
          quizAddress
        )) as ContractAddress;

        const quizInfo: QuizBasicInfo = { question, address: quizAddress };

        console.log(quizzes);

        fetchedQuizzes.push(quizInfo);
      }

      setQuizzes(fetchedQuizzes);

      console.log(quizzes);
    } catch (error) {
      console.error("Error reading contract:", error);
    }
  };

  const fetchSingleData = async (singleAddress: ContractAddress) => {
    try {
      const result = await readContract(config, {
        abi: QUIZ_GAME_ABI,
        address: singleAddress,
        functionName: "question",
      });

      return result;
    } catch (error) {
      console.error("Error reading contract:", error);
    }
  };

  const addQuizQuestion = async () => {
    try {
      const result = await writeContract(config, {
        abi: QUIZ_GAME_FACTORY_ABI,
        address: FACTORY_CONTRACT_ADDRESS,
        functionName: "createQuizGame",
        args: [question, questionAnswer, questionSalt],
        value: BigInt(6),
      });

      watchContractEvent(config, {
        address: FACTORY_CONTRACT_ADDRESS,
        abi: QUIZ_GAME_FACTORY_ABI,
        eventName: "QuizGameCreated",
        onLogs(logs: any) {
          fetchAllQuizzes();
        },
      });

      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const guessAnswer = async (
    quizAddress: ContractAddress,
    guessedAnswer: string
  ) => {
    try {
      watchContractEvent(config, {
        address: quizAddress,
        abi: QUIZ_GAME_ABI,
        eventName: "AnswerGuessedCorrectly",
        onLogs(logs: any) {
          setWinner(logs.args);

          fetchAllQuizzes();
        },
      });

      // It must be correct answer here
      const result = await writeContract(config, {
        abi: QUIZ_GAME_ABI,
        address: quizAddress,
        functionName: "guessAnswer",
        args: ["5"],
        gas: parseGwei("20"),
        maxFeePerGas: parseGwei("21"),
      });

      console.log(result);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleSubmitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeQuiz?.address) {
      await guessAnswer(activeQuiz.address, answer);
    }
  };

  const handleCreateQuizQuestion = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await addQuizQuestion();
  };

  return (
    <div className="quiz-game-container">
      <div className="quizzes-container">
        <Button
          variant="contained"
          onClick={() => {
            setActiveQuiz(undefined);
            setIsCreatingQuizQuestion(true);
          }}
          sx={{ width: "20rem" }}
        >
          Create a quiz question
        </Button>

        {quizzes.map((quiz, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() => {
              setIsCreatingQuizQuestion(false);
              setActiveQuiz(quiz);
            }}
            sx={{ width: "20rem" }}
          >
            Start the "{quiz.question}" Quizz
          </Button>
        ))}
      </div>

      {activeQuiz && (
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
      )}

      {isCreatingQuizQuestion && (
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

          <Button type="submit" variant="contained" sx={{ width: "10rem" }}>
            Enter
          </Button>
        </form>
      )}

      <InfoModal
        isOpen={!!winner?.winnerAddress}
        headerText="You guessed the right answer! And it was:"
        contentText={winner?.answer || ""}
      ></InfoModal>
    </div>
  );
};

export default QuizGameComponent;
