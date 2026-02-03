-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'paypal', 'bank_transfer')),
    provider_id VARCHAR(255), -- e.g. Stripe PaymentMethod ID
    name VARCHAR(255) NOT NULL, -- e.g. "Visa ending in 4242"
    details VARCHAR(255) NOT NULL, -- Masked details
    expiry VARCHAR(10), -- MM/YY
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" ON public.payment_methods
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users can insert own payment methods" ON public.payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update own payment methods" ON public.payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete own payment methods" ON public.payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- Function to handle setting default payment method (atomically)
CREATE OR REPLACE FUNCTION set_default_payment_method(method_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Unset all others for this user
    UPDATE public.payment_methods
    SET is_default = false
    WHERE user_id = auth.uid() AND id != method_id;

    -- Set the selected one
    UPDATE public.payment_methods
    SET is_default = true
    WHERE user_id = auth.uid() AND id = method_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
