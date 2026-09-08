import type { FormData } from './accompany'

export interface StepItem {
  key: string
  title: string
  component: any
}

export interface StepProps {
  formData: FormData
  step: number
}

export interface BasicInfoStepProps extends StepProps {}
export interface DataProductStepProps extends StepProps {}
export interface SceneStepProps extends StepProps {}
export interface CreditProductStepProps extends StepProps {}
export interface SuccessStepProps extends StepProps {}