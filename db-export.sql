-- BakerIQ Database Export
-- Generated: $(date)

-- TABLE LIST AND ROW COUNTS


-- SCHEMA DEFINITIONS
--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    user_id character varying,
    actor text NOT NULL,
    entity_type text NOT NULL,
    action text NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activity_logs OWNER TO neondb_owner;

--
-- Name: analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.analytics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    metric character varying NOT NULL,
    value integer DEFAULT 1,
    metadata json,
    date date NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.analytics OWNER TO neondb_owner;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.announcements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    priority text DEFAULT 'normal'::text,
    is_active boolean DEFAULT true,
    target_audience text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone
);


ALTER TABLE public.announcements OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    username text,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id character varying,
    details json DEFAULT '{}'::json,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: availability; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.availability (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    date date NOT NULL,
    time_slots json NOT NULL,
    is_blocked boolean DEFAULT false,
    block_reason character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.availability OWNER TO neondb_owner;

--
-- Name: baker_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.baker_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    business_hours json,
    social_media json,
    certifications text[],
    years_experience integer,
    team_size integer,
    lead_time character varying,
    consultation_fee numeric(8,2),
    minimum_order numeric(10,2),
    delivery_radius integer,
    dietary_options text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.baker_profiles OWNER TO neondb_owner;

--
-- Name: bakers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bakers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text NOT NULL,
    latitude numeric,
    longitude numeric,
    rating numeric,
    price_range text,
    specialties text[],
    description text,
    portfolio text[],
    subscription_plan text DEFAULT 'starter'::text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    stripe_connect_account_id character varying,
    stripe_account_status character varying DEFAULT 'not_started'::character varying,
    stripe_onboarding_completed boolean DEFAULT false,
    stripe_account_type character varying DEFAULT 'express'::character varying,
    subdomain character varying,
    custom_domain character varying,
    social_media json,
    stripe_customer_id character varying,
    subscription_status character varying DEFAULT 'active'::character varying,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    cancel_at_period_end boolean DEFAULT false,
    business_name text,
    tenant_id character varying,
    updated_at timestamp without time zone DEFAULT now(),
    password text NOT NULL,
    stripe_subscription_id character varying,
    slug character varying,
    payment_links json DEFAULT '{}'::json,
    availability json DEFAULT '{"mode":"template","templateKey":"mon-fri-9-5","timeZone":"America/New_York","slotMinutes":60,"minNoticeMinutes":1440,"maxAdvanceDays":60}'::json,
    email_verified boolean DEFAULT false,
    verification_token character varying,
    verification_token_expiry timestamp without time zone,
    cake_types text[],
    services text[],
    pricing json,
    reset_token_hash character varying,
    reset_token_expires_at timestamp without time zone,
    reset_token_used_at timestamp without time zone
);


ALTER TABLE public.bakers OWNER TO neondb_owner;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    start_iso timestamp without time zone NOT NULL,
    end_iso timestamp without time zone NOT NULL,
    status character varying DEFAULT 'pending'::character varying,
    notes text,
    event_type character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- Name: calculator_leads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.calculator_leads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    event_date text,
    cake_configuration json,
    estimated_price numeric(10,2),
    synced_to_sendy boolean DEFAULT false,
    sendy_list_id text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.calculator_leads OWNER TO neondb_owner;

--
-- Name: consultations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consultations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    date date NOT NULL,
    time_slot character varying NOT NULL,
    duration integer DEFAULT 60,
    type character varying DEFAULT 'consultation'::character varying,
    status character varying DEFAULT 'pending'::character varying,
    notes text,
    event_type character varying,
    event_date date,
    guest_count integer,
    budget character varying,
    dietary_restrictions text,
    consultation_fee numeric(10,2),
    deposit_amount numeric(10,2),
    payment_status character varying DEFAULT 'pending'::character varying,
    stripe_payment_intent_id character varying,
    reschedule_reason text,
    cancel_reason text,
    reminder_sent boolean DEFAULT false,
    confirmation_sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.consultations OWNER TO neondb_owner;

--
-- Name: contract_signatures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contract_signatures (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    contract_id character varying NOT NULL,
    signer_name text NOT NULL,
    signer_email text NOT NULL,
    signer_type text NOT NULL,
    signature_data text,
    ip_address text,
    user_agent text,
    signed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_signatures OWNER TO neondb_owner;

--
-- Name: contract_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contract_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    name text NOT NULL,
    description text,
    template text NOT NULL,
    category text,
    terms text,
    cancellation_policy text,
    payment_terms text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_templates OWNER TO neondb_owner;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contracts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    customer_id character varying,
    quote_id character varying,
    template_id character varying,
    contract_number text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    total_amount numeric(10,2),
    deposit_amount numeric(10,2),
    remaining_balance numeric(10,2),
    event_date date,
    delivery_date date,
    setup_time text,
    delivery_address text,
    special_instructions text,
    status text DEFAULT 'draft'::text,
    signed_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    contract_origin text DEFAULT 'from_quote'::text,
    payment_snapshot jsonb
);


ALTER TABLE public.contracts OWNER TO neondb_owner;

--
-- Name: COLUMN contracts.contract_origin; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.contracts.contract_origin IS 'Tracks contract creation source: from_quote or direct';


--
-- Name: COLUMN contracts.payment_snapshot; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.contracts.payment_snapshot IS 'Frozen snapshot of payment methods shown when contract was sent';


--
-- Name: customer_notes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    note text NOT NULL,
    type text DEFAULT 'general'::text,
    is_private boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customer_notes OWNER TO neondb_owner;

--
-- Name: customer_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    session_token character varying NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customer_sessions OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    partner_name text,
    event_date date,
    event_type text DEFAULT 'wedding'::text,
    venue text,
    venue_address text,
    guest_count integer,
    budget text,
    source text,
    status text DEFAULT 'inquiry'::text,
    dietary_restrictions json DEFAULT '{}'::json,
    preferences json DEFAULT '{}'::json,
    priority text DEFAULT 'medium'::text,
    tags text[],
    last_contact_date timestamp without time zone,
    next_follow_up_date date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stripe_customer_id character varying,
    has_portal_access boolean DEFAULT false,
    portal_password text,
    portal_last_login timestamp without time zone,
    portal_activation_token character varying,
    portal_activated_at timestamp without time zone
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: data_export_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.data_export_jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    job_type text NOT NULL,
    parameters json DEFAULT '{}'::json,
    status text DEFAULT 'pending'::text,
    file_url text,
    total_records integer,
    processed_records integer DEFAULT 0,
    error_message text,
    requested_by_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.data_export_jobs OWNER TO neondb_owner;

--
-- Name: email_campaign_enrollments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_campaign_enrollments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    baker_id character varying,
    campaign_key text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_step_sent integer DEFAULT 0,
    last_sent_at timestamp without time zone,
    enrolled_at timestamp without time zone DEFAULT now(),
    converted_at timestamp without time zone,
    converted_plan text,
    send_hour integer DEFAULT 16,
    metadata json DEFAULT '{}'::json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_campaign_enrollments OWNER TO neondb_owner;

--
-- Name: email_campaign_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_campaign_events (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    enrollment_id character varying NOT NULL,
    user_id character varying,
    baker_id character varying,
    campaign_key text NOT NULL,
    step integer NOT NULL,
    event_type text NOT NULL,
    metadata json DEFAULT '{}'::json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_campaign_events OWNER TO neondb_owner;

--
-- Name: email_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    filters json,
    template_key text,
    subject text NOT NULL,
    body text NOT NULL,
    total_recipients integer DEFAULT 0,
    sent_count integer DEFAULT 0,
    failed_count integer DEFAULT 0,
    status text DEFAULT 'queued'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_jobs OWNER TO neondb_owner;

--
-- Name: estimates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.estimates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    profile_id character varying,
    name text NOT NULL,
    event_date text,
    guest_count integer,
    tiers integer,
    base_size integer,
    shape text,
    cake_flavor text,
    filling text,
    decorations json DEFAULT '{}'::json,
    delivery text,
    distance text,
    special_requests text,
    subtotal numeric,
    tax numeric,
    total numeric,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id character varying
);


ALTER TABLE public.estimates OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    customer_id character varying,
    contract_id character varying,
    quote_id character varying,
    invoice_number text NOT NULL,
    title text NOT NULL,
    description text,
    subtotal numeric(10,2),
    tax_amount numeric(10,2),
    total numeric(10,2),
    paid_amount numeric(10,2) DEFAULT '0'::numeric,
    remaining_balance numeric(10,2),
    due_date date,
    status text DEFAULT 'draft'::text,
    sent_at timestamp without time zone,
    paid_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: leads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying,
    profile_id character varying,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text,
    wedding_date text,
    guest_count integer,
    budget text,
    message text,
    status text DEFAULT 'new'::text,
    estimate_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id character varying,
    signature text
);


ALTER TABLE public.leads OWNER TO neondb_owner;

--
-- Name: maintenance_schedule; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_schedule (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone NOT NULL,
    status text DEFAULT 'scheduled'::text,
    impact_level text DEFAULT 'low'::text,
    affected_systems json DEFAULT '[]'::json,
    scheduled_by_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenance_schedule OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    lead_id character varying,
    sender_id character varying,
    sender_type text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: payment_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    contract_id character varying NOT NULL,
    customer_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    total_amount numeric(10,2),
    paid_amount numeric(10,2) DEFAULT '0'::numeric,
    remaining_amount numeric(10,2),
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payment_plans OWNER TO neondb_owner;

--
-- Name: payment_schedule; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_schedule (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    plan_id character varying NOT NULL,
    due_date date NOT NULL,
    amount numeric(10,2),
    description text,
    status text DEFAULT 'pending'::text,
    paid_at timestamp without time zone,
    transaction_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payment_schedule OWNER TO neondb_owner;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    partner_name text,
    wedding_date text,
    venue text,
    venue_address text,
    budget text,
    restrictions json DEFAULT '{}'::json,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    tenant_id character varying
);


ALTER TABLE public.profiles OWNER TO neondb_owner;

--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quote_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quote_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    quantity numeric(8,2) DEFAULT '1'::numeric,
    unit_price numeric(8,2),
    total_price numeric(10,2),
    category text,
    sort_order integer DEFAULT 0
);


ALTER TABLE public.quote_items OWNER TO neondb_owner;

--
-- Name: quote_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quote_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    name text NOT NULL,
    description text,
    category text,
    base_price numeric(10,2),
    price_per_serving numeric(8,2),
    tiers json DEFAULT '[]'::json,
    add_ons json DEFAULT '[]'::json,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    subcategory text,
    minimum_order numeric(10,2),
    pricing_model text DEFAULT 'fixed'::text,
    seasonal_pricing json DEFAULT '[]'::json,
    volume_discounts json DEFAULT '[]'::json,
    flavor_options json DEFAULT '[]'::json,
    filling_options json DEFAULT '[]'::json,
    delivery_options json DEFAULT '[]'::json,
    lead_time integer DEFAULT 168,
    max_advance_booking integer DEFAULT 8760,
    cancellation_policy text,
    tags text[] DEFAULT '{}'::text[],
    difficulty text DEFAULT 'medium'::text,
    estimated_hours numeric(5,2),
    profit_margin numeric(5,2),
    is_public boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    terms text,
    notes text
);


ALTER TABLE public.quote_templates OWNER TO neondb_owner;

--
-- Name: quotes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    baker_id character varying,
    customer_id character varying,
    template_id character varying,
    quote_number text NOT NULL,
    title text NOT NULL,
    description text,
    event_date date,
    event_type text,
    guest_count integer,
    delivery_address text,
    setup_time text,
    subtotal numeric(10,2),
    tax_rate numeric(5,4) DEFAULT 0.0875,
    tax_amount numeric(10,2),
    total numeric(10,2),
    deposit_amount numeric(10,2),
    deposit_percentage numeric(5,2) DEFAULT 50.00,
    status text DEFAULT 'draft'::text,
    valid_until date,
    customer_notes text,
    internal_notes text,
    terms text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    sent_at timestamp without time zone,
    viewed_at timestamp without time zone,
    approved_at timestamp without time zone,
    approval_token text,
    approval_token_expires_at timestamp without time zone,
    declined_at timestamp without time zone,
    decline_reason text,
    lead_id character varying
);


ALTER TABLE public.quotes OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    customer_id character varying,
    customer_name character varying NOT NULL,
    customer_email character varying NOT NULL,
    rating integer NOT NULL,
    review_text text,
    wedding_date date,
    cake_style character varying,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: sendy_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sendy_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    plan_mappings json DEFAULT '{}'::json,
    sync_enabled boolean DEFAULT false,
    last_sync_at timestamp without time zone,
    last_sync_status text,
    last_sync_message text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    calculator_leads_list_id text
);


ALTER TABLE public.sendy_settings OWNER TO neondb_owner;

--
-- Name: super_admin_campaign_sends; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.super_admin_campaign_sends (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    campaign_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    bounced_at timestamp without time zone,
    failed_at timestamp without time zone,
    error_message text,
    metadata json DEFAULT '{}'::json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.super_admin_campaign_sends OWNER TO neondb_owner;

--
-- Name: super_admin_campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.super_admin_campaigns (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    segment_filter json DEFAULT '{}'::json,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_at timestamp without time zone,
    sent_at timestamp without time zone,
    stats json DEFAULT '{}'::json,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.super_admin_campaigns OWNER TO neondb_owner;

--
-- Name: system_announcements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_announcements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text,
    target_audience text DEFAULT 'all'::text,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone,
    created_by_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_announcements OWNER TO neondb_owner;

--
-- Name: system_health_metrics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_health_metrics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric(10,2),
    unit text,
    status text DEFAULT 'healthy'::text,
    threshold numeric(10,2),
    recorded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_health_metrics OWNER TO neondb_owner;

--
-- Name: team_invitations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_invitations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    email character varying NOT NULL,
    role character varying DEFAULT 'viewer'::character varying NOT NULL,
    invited_by character varying NOT NULL,
    invitation_token character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    invited_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    accepted_at timestamp without time zone
);


ALTER TABLE public.team_invitations OWNER TO neondb_owner;

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_members (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    role character varying DEFAULT 'viewer'::character varying NOT NULL,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    invited_by character varying,
    invited_at timestamp without time zone DEFAULT now(),
    last_active timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_members OWNER TO neondb_owner;

--
-- Name: tenant_baker_networks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenant_baker_networks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    is_approved boolean DEFAULT false,
    commission_rate numeric(5,4) DEFAULT 0.0500,
    priority integer DEFAULT 0,
    is_exclusive boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_baker_networks OWNER TO neondb_owner;

--
-- Name: tenant_configurations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenant_configurations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    logo_url text,
    primary_color character varying DEFAULT '#B8860B'::character varying,
    secondary_color character varying DEFAULT '#F5E6B3'::character varying,
    accent_color character varying DEFAULT '#8B7355'::character varying,
    custom_messages json DEFAULT '{}'::json,
    custom_css text,
    email_templates json DEFAULT '{}'::json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_configurations OWNER TO neondb_owner;

--
-- Name: tenant_revenue_sharing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenant_revenue_sharing (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    lead_id character varying NOT NULL,
    baker_id character varying NOT NULL,
    order_amount numeric(10,2),
    tenant_commission numeric(10,2),
    baker_payout numeric(10,2),
    commission_rate numeric(5,4),
    status text DEFAULT 'pending'::text,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_revenue_sharing OWNER TO neondb_owner;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subdomain character varying NOT NULL,
    custom_domain character varying,
    contact_email text NOT NULL,
    contact_phone text,
    address text,
    subscription_plan text DEFAULT 'basic'::text,
    subscription_status text DEFAULT 'active'::text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenants OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    baker_id character varying NOT NULL,
    customer_id character varying,
    lead_id character varying,
    type character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying DEFAULT 'usd'::character varying,
    status character varying NOT NULL,
    stripe_payment_intent_id character varying,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text,
    role text DEFAULT 'admin'::text,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    reset_token_hash text,
    reset_token_expires_at timestamp without time zone,
    reset_token_used_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: availability availability_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.availability
    ADD CONSTRAINT availability_pkey PRIMARY KEY (id);


--
-- Name: baker_profiles baker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.baker_profiles
    ADD CONSTRAINT baker_profiles_pkey PRIMARY KEY (id);


--
-- Name: bakers bakers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bakers
    ADD CONSTRAINT bakers_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: calculator_leads calculator_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.calculator_leads
    ADD CONSTRAINT calculator_leads_pkey PRIMARY KEY (id);


--
-- Name: consultations consultations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consultations
    ADD CONSTRAINT consultations_pkey PRIMARY KEY (id);


--
-- Name: contract_signatures contract_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contract_signatures
    ADD CONSTRAINT contract_signatures_pkey PRIMARY KEY (id);


--
-- Name: contract_templates contract_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contract_templates
    ADD CONSTRAINT contract_templates_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: customer_notes customer_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_pkey PRIMARY KEY (id);


--
-- Name: customer_sessions customer_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_sessions
    ADD CONSTRAINT customer_sessions_pkey PRIMARY KEY (id);


--
-- Name: customer_sessions customer_sessions_session_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_sessions
    ADD CONSTRAINT customer_sessions_session_token_unique UNIQUE (session_token);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: data_export_jobs data_export_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_export_jobs
    ADD CONSTRAINT data_export_jobs_pkey PRIMARY KEY (id);


--
-- Name: email_campaign_enrollments email_campaign_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_enrollments
    ADD CONSTRAINT email_campaign_enrollments_pkey PRIMARY KEY (id);


--
-- Name: email_campaign_events email_campaign_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_events
    ADD CONSTRAINT email_campaign_events_pkey PRIMARY KEY (id);


--
-- Name: email_jobs email_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_jobs
    ADD CONSTRAINT email_jobs_pkey PRIMARY KEY (id);


--
-- Name: estimates estimates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.estimates
    ADD CONSTRAINT estimates_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: maintenance_schedule maintenance_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: payment_plans payment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_pkey PRIMARY KEY (id);


--
-- Name: payment_schedule payment_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_schedule
    ADD CONSTRAINT payment_schedule_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quote_templates quote_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_approval_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_approval_token_key UNIQUE (approval_token);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: sendy_settings sendy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sendy_settings
    ADD CONSTRAINT sendy_settings_pkey PRIMARY KEY (id);


--
-- Name: super_admin_campaign_sends super_admin_campaign_sends_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.super_admin_campaign_sends
    ADD CONSTRAINT super_admin_campaign_sends_pkey PRIMARY KEY (id);


--
-- Name: super_admin_campaigns super_admin_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.super_admin_campaigns
    ADD CONSTRAINT super_admin_campaigns_pkey PRIMARY KEY (id);


--
-- Name: system_announcements system_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_announcements
    ADD CONSTRAINT system_announcements_pkey PRIMARY KEY (id);


--
-- Name: system_health_metrics system_health_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_health_metrics
    ADD CONSTRAINT system_health_metrics_pkey PRIMARY KEY (id);


--
-- Name: team_invitations team_invitations_invitation_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invitation_token_unique UNIQUE (invitation_token);


--
-- Name: team_invitations team_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: tenant_baker_networks tenant_baker_networks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_baker_networks
    ADD CONSTRAINT tenant_baker_networks_pkey PRIMARY KEY (id);


--
-- Name: tenant_configurations tenant_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_configurations
    ADD CONSTRAINT tenant_configurations_pkey PRIMARY KEY (id);


--
-- Name: tenant_revenue_sharing tenant_revenue_sharing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_revenue_sharing
    ADD CONSTRAINT tenant_revenue_sharing_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_subdomain_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subdomain_unique UNIQUE (subdomain);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: leads_signature_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX leads_signature_idx ON public.leads USING btree (signature);


--
-- Name: activity_logs activity_logs_tenant_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_tenant_id_bakers_id_fk FOREIGN KEY (tenant_id) REFERENCES public.bakers(id);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: contract_signatures contract_signatures_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contract_signatures
    ADD CONSTRAINT contract_signatures_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: contract_templates contract_templates_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contract_templates
    ADD CONSTRAINT contract_templates_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: contract_templates contract_templates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contract_templates
    ADD CONSTRAINT contract_templates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: contracts contracts_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: contracts contracts_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: contracts contracts_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: contracts contracts_template_id_contract_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_template_id_contract_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.contract_templates(id);


--
-- Name: contracts contracts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: customer_notes customer_notes_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: customer_notes customer_notes_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_notes
    ADD CONSTRAINT customer_notes_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_sessions customer_sessions_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_sessions
    ADD CONSTRAINT customer_sessions_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customers customers_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: customers customers_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: data_export_jobs data_export_jobs_requested_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_export_jobs
    ADD CONSTRAINT data_export_jobs_requested_by_id_users_id_fk FOREIGN KEY (requested_by_id) REFERENCES public.users(id);


--
-- Name: email_campaign_enrollments email_campaign_enrollments_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_enrollments
    ADD CONSTRAINT email_campaign_enrollments_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: email_campaign_enrollments email_campaign_enrollments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_enrollments
    ADD CONSTRAINT email_campaign_enrollments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: email_campaign_events email_campaign_events_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_events
    ADD CONSTRAINT email_campaign_events_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: email_campaign_events email_campaign_events_enrollment_id_email_campaign_enrollments_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_events
    ADD CONSTRAINT email_campaign_events_enrollment_id_email_campaign_enrollments_ FOREIGN KEY (enrollment_id) REFERENCES public.email_campaign_enrollments(id);


--
-- Name: email_campaign_events email_campaign_events_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaign_events
    ADD CONSTRAINT email_campaign_events_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: estimates estimates_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.estimates
    ADD CONSTRAINT estimates_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: estimates estimates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.estimates
    ADD CONSTRAINT estimates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: invoices invoices_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: invoices invoices_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: invoices invoices_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: leads leads_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: leads leads_estimate_id_estimates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_estimate_id_estimates_id_fk FOREIGN KEY (estimate_id) REFERENCES public.estimates(id);


--
-- Name: leads leads_profile_id_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_profile_id_profiles_id_fk FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- Name: leads leads_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: maintenance_schedule maintenance_schedule_scheduled_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_schedule
    ADD CONSTRAINT maintenance_schedule_scheduled_by_id_users_id_fk FOREIGN KEY (scheduled_by_id) REFERENCES public.users(id);


--
-- Name: messages messages_lead_id_leads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_lead_id_leads_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: payment_plans payment_plans_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: payment_plans payment_plans_contract_id_contracts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_contract_id_contracts_id_fk FOREIGN KEY (contract_id) REFERENCES public.contracts(id);


--
-- Name: payment_plans payment_plans_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_plans
    ADD CONSTRAINT payment_plans_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: payment_schedule payment_schedule_plan_id_payment_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_schedule
    ADD CONSTRAINT payment_schedule_plan_id_payment_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.payment_plans(id);


--
-- Name: payment_schedule payment_schedule_transaction_id_transactions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_schedule
    ADD CONSTRAINT payment_schedule_transaction_id_transactions_id_fk FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- Name: profiles profiles_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: profiles profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quote_items quote_items_quote_id_quotes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_quotes_id_fk FOREIGN KEY (quote_id) REFERENCES public.quotes(id);


--
-- Name: quote_templates quote_templates_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: quote_templates quote_templates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quote_templates
    ADD CONSTRAINT quote_templates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: quotes quotes_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: quotes quotes_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: quotes quotes_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: quotes quotes_template_id_quote_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_template_id_quote_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.quote_templates(id);


--
-- Name: quotes quotes_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: super_admin_campaign_sends super_admin_campaign_sends_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.super_admin_campaign_sends
    ADD CONSTRAINT super_admin_campaign_sends_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: super_admin_campaign_sends super_admin_campaign_sends_campaign_id_super_admin_campaigns_id; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.super_admin_campaign_sends
    ADD CONSTRAINT super_admin_campaign_sends_campaign_id_super_admin_campaigns_id FOREIGN KEY (campaign_id) REFERENCES public.super_admin_campaigns(id);


--
-- Name: system_announcements system_announcements_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_announcements
    ADD CONSTRAINT system_announcements_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: team_invitations team_invitations_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: team_invitations team_invitations_invited_by_team_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_invited_by_team_members_id_fk FOREIGN KEY (invited_by) REFERENCES public.team_members(id);


--
-- Name: team_invitations team_invitations_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_invitations
    ADD CONSTRAINT team_invitations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: team_members team_members_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: team_members team_members_invited_by_team_members_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_invited_by_team_members_id_fk FOREIGN KEY (invited_by) REFERENCES public.team_members(id);


--
-- Name: team_members team_members_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_baker_networks tenant_baker_networks_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_baker_networks
    ADD CONSTRAINT tenant_baker_networks_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: tenant_baker_networks tenant_baker_networks_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_baker_networks
    ADD CONSTRAINT tenant_baker_networks_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_configurations tenant_configurations_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_configurations
    ADD CONSTRAINT tenant_configurations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_revenue_sharing tenant_revenue_sharing_baker_id_bakers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_revenue_sharing
    ADD CONSTRAINT tenant_revenue_sharing_baker_id_bakers_id_fk FOREIGN KEY (baker_id) REFERENCES public.bakers(id);


--
-- Name: tenant_revenue_sharing tenant_revenue_sharing_lead_id_leads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_revenue_sharing
    ADD CONSTRAINT tenant_revenue_sharing_lead_id_leads_id_fk FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: tenant_revenue_sharing tenant_revenue_sharing_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_revenue_sharing
    ADD CONSTRAINT tenant_revenue_sharing_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

