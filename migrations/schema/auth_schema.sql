--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

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
-- Name: Raters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Raters" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "clientId" integer NOT NULL,
    "vendorName" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "totalPremium" character varying(255),
    succeeded boolean,
    error character varying(255),
    "quoteId" character varying(255),
    months character varying(255),
    "downPayment" character varying(255),
    "stepResult" json,
    "quoteIds" json,
    "productType" character varying(255),
    url character varying(255)
);


ALTER TABLE public."Raters" OWNER TO postgres;

--
-- Name: Raters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Raters_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Raters_id_seq" OWNER TO postgres;

--
-- Name: Raters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Raters_id_seq" OWNED BY public."Raters".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sessions" (
    sid character varying(36) NOT NULL,
    expires timestamp with time zone,
    data text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Sessions" OWNER TO postgres;

--
-- Name: Vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vendors" (
    id integer NOT NULL,
    "companyId" integer NOT NULL,
    "vendorName" character varying(255),
    username character varying(255),
    password character varying(255),
    "accessToken" character varying(255),
    state character varying(255),
    carrier character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "agentId" integer,
    agency character varying(255)
);


ALTER TABLE public."Vendors" OWNER TO postgres;

--
-- Name: Vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Vendors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Vendors_id_seq" OWNER TO postgres;

--
-- Name: Vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vendors_id_seq" OWNED BY public."Vendors".id;


--
-- Name: Raters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Raters" ALTER COLUMN id SET DEFAULT nextval('public."Raters_id_seq"'::regclass);


--
-- Name: Vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vendors" ALTER COLUMN id SET DEFAULT nextval('public."Vendors_id_seq"'::regclass);


--
-- Name: Raters Raters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Raters"
    ADD CONSTRAINT "Raters_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Sessions Sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sessions"
    ADD CONSTRAINT "Sessions_pkey" PRIMARY KEY (sid);


--
-- Name: Vendors Vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vendors"
    ADD CONSTRAINT "Vendors_pkey" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

