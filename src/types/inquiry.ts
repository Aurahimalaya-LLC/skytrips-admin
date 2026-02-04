export type InquiryPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type InquiryStatus = 'NEW' | 'PROCESSING' | 'QUOTE_SENT' | 'FOLLOW_UP';

export interface FlightInquiry {
    id: string;
    inquiry_number: string;
    client_name: string;
    departure_code: string;
    arrival_code: string;
    start_date: string;
    end_date: string;
    priority: InquiryPriority;
    status: InquiryStatus;
    assignee_id?: string;
    created_at: string;
    updated_at: string;
}
