import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { Button, TextField } from "@mui/material";

import { config } from "../../config";

import { QUIZ_GAME_FACTORY_ABI } from "../../utils/abi/QuizGameFactory";
import { QUIZ_GAME_ABI } from "../../utils/abi/QuizGame";

import { QuizBasicInfo } from "../../models/Quiz";
import { ContractAddress } from "../../models/ContractAddress";

import "./QuizGame.scss";

const FACTORY_CONTRACT_ADDRESS = "0x4B67330d175E2De9319A6b65DF20a8Ddb1e8b8F3";

export const QuizGameComponent = () => {
  const { address } = useAccount();

  const [quizzes, setQuizzes] = useState<QuizBasicInfo[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizBasicInfo>();
  const [answer, setAnswer] = useState("");
  const [betAmount, setBetAmount] = useState(0);

  useEffect(() => {
    fetchAllQuizzes();
  }, []);

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

  const writeData = async () => {
    try {
      const result = await writeContract(config, {
        abi: QUIZ_GAME_FACTORY_ABI,
        address: FACTORY_CONTRACT_ADDRESS,
        functionName: "createQuizGame",
        args: ["Kolko e 2 + 2?", "4", "Salty sea sure"],
        value: BigInt(600000),
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
      const result = await writeContract(config, {
        abi: QUIZ_GAME_ABI,
        address: "0x55f77CbFC5694262cD09d1FB0CEd81B9B5e5F7db",
        functionName: "guessAnswer",
        args: ["4"],
        value: BigInt(555),
      });

      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.target.value);
  };

  const handleBetAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBetAmount(+event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeQuiz?.address) {
      await guessAnswer(activeQuiz.address, answer);
    }
  };

  return (
    <div className="quiz-game-container">
      <div className="quizzes-container">
        {quizzes.map((quiz, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() => setActiveQuiz(quiz)}
            sx={{ width: "20rem" }}
          >
            Start the "{quiz.question}" Quizz
          </Button>
        ))}
      </div>
      {activeQuiz && (
        <form onSubmit={handleSubmit} className="game-container">
          <div>{activeQuiz.question}</div>

          <TextField
            id="answer"
            label="Answer here"
            variant="outlined"
            value={answer}
            onChange={handleAnswerChange}
            sx={{ width: "15rem" }}
          />
          <TextField
            id="betAmount"
            label="$WEI to bet"
            type="number"
            variant="outlined"
            value={betAmount}
            onChange={handleBetAmountChange}
            sx={{ width: "15rem" }}
          />
          <Button type="submit" variant="contained" sx={{ width: "10rem" }}>
            Enter
          </Button>
        </form>
      )}
    </div>
  );
};

export default QuizGameComponent;
