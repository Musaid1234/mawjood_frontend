import { API_ENDPOINTS } from '@/config/api.config';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';

export interface CRBasicInfo {
  crNationalNumber: string;
  crNumber: string;
  versionNo: number;
  name: string;
  duration: number;
  isMain: boolean;
  issueDateGregorian: string;
  issueDateHijri: string;
  hasEcommerce: boolean;
  headquarterCityName: string;
  isLicenseBased: boolean;
  entityType: {
    id: number;
    name: string;
    formId: number;
    formName: string;
    characterList?: Array<{
      id: number;
      name: string;
    }>;
  };
  status: {
    id: number;
    name: string;
  };
  activities: Array<{
    id: string;
    name: string;
  }>;
}

export interface CRFullInfo extends CRBasicInfo {
  crCapital: number;
  inLiquidationProcess: boolean;
  contactInfo?: {
    phoneNo?: string;
    mobileNo?: string;
    email?: string;
    websiteUrl?: string;
  };
  capital: {
    currencyId: number;
    currencyName: string;
  };
  parties: Array<{
    name: string;
    typeId: number;
    typeName: string;
    identity: {
      id: string;
      typeId: number;
      typeName: string;
    };
    partnership?: Array<{
      id: number;
      name: string;
    }>;
    nationality?: {
      id: number;
      name: string;
    };
  }>;
  management?: {
    structureId: number;
    structureName: string;
    managers: Array<{
      name: string;
      positions: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
}

export interface CRStatus {
  id: number;
  name: string;
  confirmationDate?: {
    gregorian: string;
    hijri: string;
  };
  reactivationDate?: {
    gregorian: string;
    hijri: string;
  };
  suspensionDate?: {
    gregorian: string;
    hijri: string;
  };
  deletionDate?: {
    gregorian: string;
    hijri: string;
  };
}

export interface CROwnership {
  ownsCr: boolean;
}

export interface WathqServiceStatus {
  available: boolean;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }
  throw error;
};

export const crService = {
  /**
   * Check if CR verification service is available
   */
  async checkServiceStatus(): Promise<WathqServiceStatus> {
    try {
      const response = await axiosInstance.get<ApiResponse<WathqServiceStatus>>(
        `${API_ENDPOINTS.CR?.STATUS || '/api/cr/status'}`
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify CR number - Basic Info
   * @param crNumber - Commercial Registration Number (10 digits)
   * @param language - 'ar' or 'en'
   */
  async verifyBasic(crNumber: string, language: 'ar' | 'en' = 'ar'): Promise<CRBasicInfo> {
    try {
      const response = await axiosInstance.get<ApiResponse<CRBasicInfo>>(
        `${API_ENDPOINTS.CR?.VERIFY_BASIC || '/api/cr/verify/basic'}/${crNumber}`,
        {
          params: { language },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verify CR number - Full Info (includes owners and detailed information)
   * @param crNumber - Commercial Registration Number (10 digits)
   * @param language - 'ar' or 'en'
   */
  async verifyFull(crNumber: string, language: 'ar' | 'en' = 'ar'): Promise<CRFullInfo> {
    try {
      const response = await axiosInstance.get<ApiResponse<CRFullInfo>>(
        `${API_ENDPOINTS.CR?.VERIFY_FULL || '/api/cr/verify/full'}/${crNumber}`,
        {
          params: { language },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get CR Status
   * @param crNumber - Commercial Registration Number (10 digits)
   * @param language - 'ar' or 'en'
   * @param includeDates - Whether to include status dates
   */
  async getStatus(
    crNumber: string,
    language: 'ar' | 'en' = 'ar',
    includeDates: boolean = false
  ): Promise<CRStatus> {
    try {
      const response = await axiosInstance.get<ApiResponse<CRStatus>>(
        `${API_ENDPOINTS.CR?.GET_STATUS || '/api/cr/status'}/${crNumber}`,
        {
          params: { language, includeDates },
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Check if a person owns a CR
   * @param id - Identifier number
   * @param idType - Type of identifier
   * @param nationality - Nationality NIC code (optional)
   */
  async checkOwnership(
    id: string,
    idType: 'National_ID' | 'Resident_ID' | 'Passport' | 'GCC_ID' | 'CR_National_ID',
    nationality?: number
  ): Promise<CROwnership> {
    try {
      const response = await axiosInstance.get<ApiResponse<CROwnership>>(
        `${API_ENDPOINTS.CR?.CHECK_OWNERSHIP || '/api/cr/ownership'}/${id}/${idType}`,
        {
          params: nationality ? { nationality } : {},
        }
      );
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};

