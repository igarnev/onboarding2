import { ContractAddress } from "./ContractAddress";

export interface QuizBasicInfo {
  readonly address: ContractAddress;
  readonly question: string;
}
