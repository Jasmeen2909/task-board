import { Amount } from "./amount";
import { Prospect } from "./prospect";
import { Skill } from "./skill";

export interface Task {
  id: number;
  totalCount: any;
  main_id: string;
  ciphertext: string;
  amount: Amount;
  amount_rawValue: string;
  amount_displayValue: string;
  amount_currency: string;
  hourlyBudgetType: any;
  hourlyBudgetMin_rawValue: any;
  hourlyBudgetMax_rawValue: any;
  title: string;
  description: string;
  createdDateTime: string;
  totalApplicants: number;
  willingToHire: number;
  category: string;
  subcategory: string;
  experienceLevel: string;
  skills: Skill[];
  prospect: Prospect;
  prospect_verificationStatus: string;
  prospect_totalReviews: number;
  prospect_totalFeedback: number;
  prospect_totalHires: number;
  prospect_totalPostedJobs: number;
  prospect_location_country: string;
  created_at: string;
  status: string;
}
