import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { Connector, useAccount, useConnect } from "wagmi";
import { Button } from "@mui/material";

import { config } from "../../config";

import { QUIZ_GAME_FACTORY_ABI } from "../../utils/abi/QuizGameFactory";
import { QUIZ_GAME_ABI } from "../../utils/abi/QuizGame";

import { QuizBasicInfo } from "../../models/Quiz";
import { ContractAddress } from "../../models/ContractAddress";
import { ModalProps } from "../../models/Modal";

import InfoModal from "../../components/Modal/InfoModal";
import { CircularProgressComponent } from "../../components/CircularProgress/CircularProgress";
import { AnswerQuizQuestion } from "../../components/AnswerQuizQuestion/AnswerQuizQuestion";
import { CreateQuizQuestion } from "../../components/CreateQuizQuestion/CreateQuizQuestion";

import "./QuizGame.scss";

export const QuizGameComponent = () => {
  const { address, chain } = useAccount();
  const { connectors } = useConnect();

  const [connector, setConnector] = useState<Connector>();
  const [quizzes, setQuizzes] = useState<QuizBasicInfo[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizBasicInfo>();
  const [isCreatingQuizQuestion, setIsCreatingQuizQuestion] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalProps, setModalProps] = useState<ModalProps>({
    headerText: "",
    contentText: "",
  });

  useEffect(() => {
    if (address && chain?.name === "Sepolia") {
      setConnector(
        connectors.filter((connector) => connector.id === "io.metamask")[0]
      );

      fetchAllQuizzes();
    }
  }, [address, chain, connectors]);

  const fetchAllQuizzes = async () => {
    try {
      setIsLoading(true);
      const result = (await readContract(config, {
        abi: QUIZ_GAME_FACTORY_ABI,
        address: import.meta.env.FACTORY_CONTRACT_ADDRESS,
        functionName: "getQuizGames",
        chainId: chain?.id,
      })) as ContractAddress[];

      if (!result || result.length === 0) {
        throw new Error("No quiz games found.");
      }

      const fetchedQuizzes: QuizBasicInfo[] = [];

      for (const quizAddress of result) {
        const question = (await fetchSingleData(
          quizAddress
        )) as ContractAddress;

        const quizInfo: QuizBasicInfo = { question, address: quizAddress };

        fetchedQuizzes.push(quizInfo);
      }

      setQuizzes(fetchedQuizzes);
    } catch (error) {
      console.error("Error reading contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleData = async (singleAddress: ContractAddress) => {
    try {
      const result = await readContract(config, {
        abi: QUIZ_GAME_ABI,
        address: singleAddress,
        functionName: "question",
        chainId: chain?.id,
      });

      return result;
    } catch (error: any) {
      setModalProps({
        headerText: "An error has occurred",
        contentText: error.message,
      });
      setIsLoading(false);
    }
  };

  if (chain?.name !== "Sepolia") {
    return (
      <div className="sepolia-error">Please change the network to Sepolia!</div>
    );
  }

  return (
    <div className="quiz-game-container">
      {isLoading && <CircularProgressComponent />}

      <div className="quizzes-container">
        <Button
          variant="contained"
          onClick={() => {
            setActiveQuiz(undefined);
            setIsCreatingQuizQuestion(true);
          }}
          sx={{ width: "20rem" }}
          disabled={!address}
        >
          Create a quiz question
        </Button>

        <div>
          <div className="available-quizzes">Available quizzes: </div>

          <div className="start-quizzes-buttons">
            {quizzes.length ? (
              quizzes.map((quiz, index) => (
                <Button
                  key={index}
                  variant="contained"
                  onClick={() => {
                    setIsCreatingQuizQuestion(false);
                    setActiveQuiz(quiz);
                  }}
                  sx={{ width: "20rem" }}
                >
                  Start the "{quiz.question}" Quiz
                </Button>
              ))
            ) : (
              <div>No quizzes available!</div>
            )}
          </div>
        </div>
      </div>

      {activeQuiz && connector && (
        <AnswerQuizQuestion
          activeQuiz={activeQuiz}
          connector={connector}
          setIsLoading={setIsLoading}
          setModalProps={setModalProps}
          fetchAllQuizzes={fetchAllQuizzes}
        />
      )}

      {isCreatingQuizQuestion && connector && (
        <CreateQuizQuestion
          connector={connector}
          setIsLoading={setIsLoading}
          setModalProps={setModalProps}
          fetchAllQuizzes={fetchAllQuizzes}
        />
      )}

      <InfoModal
        modalProps={modalProps}
        setModalProps={setModalProps}
      ></InfoModal>
    </div>
  );
};

export default QuizGameComponent;
