export const QUIZ_GAME_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "quizGameAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "question",
        type: "string",
      },
    ],
    name: "QuizGameCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_question",
        type: "string",
      },
      {
        internalType: "string",
        name: "_answer",
        type: "string",
      },
      {
        internalType: "string",
        name: "_salt",
        type: "string",
      },
    ],
    name: "createQuizGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getQuizGames",
    outputs: [
      {
        internalType: "contract QuizGame[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "quizGames",
    outputs: [
      {
        internalType: "contract QuizGame",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
