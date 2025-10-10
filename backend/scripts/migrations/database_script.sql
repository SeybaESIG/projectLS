--
-- PostgreSQL database dump
--

\restrict FFO1FOp07Q1CzUwYWuroUYPnWpixykg4KmU4GQyQUp1Ya0762dvgZqb7jAwUgeY

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: tb_abonnements; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_abonnements (
                                       id_abonnement integer NOT NULL,
                                       id_util integer NOT NULL,
                                       id_type_abonnement integer NOT NULL,
                                       date_debut timestamp without time zone NOT NULL,
                                       date_fin timestamp without time zone NOT NULL,
                                       CONSTRAINT tb_abonnements_dates_check CHECK ((date_fin > date_debut))
);


ALTER TABLE public.tb_abonnements OWNER TO akslasj;

--
-- Name: abonnements_id_abonnement_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_abonnements ALTER COLUMN id_abonnement ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.abonnements_id_abonnement_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_historique_abonnements; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_historique_abonnements (
                                                  id_histo_abo integer NOT NULL,
                                                  id_type_abonnement integer NOT NULL,
                                                  nom_type character varying(100) NOT NULL,
                                                  prix numeric(10,2) NOT NULL,
                                                  duree_mois integer NOT NULL,
                                                  description text,
                                                  action_histo character varying(10) NOT NULL,
                                                  CONSTRAINT chk_action_histo CHECK (((action_histo)::text = ANY (ARRAY[('insert'::character varying)::text, ('update'::character varying)::text, ('delete'::character varying)::text]))),
                                                  CONSTRAINT tb_historique_abonnements_prix_check CHECK ((prix > (0)::numeric)),
                                                  CONSTRAINT tb_historique_abonnements_duree_check CHECK ((duree_mois > 0))
);


ALTER TABLE public.tb_historique_abonnements OWNER TO akslasj;

--
-- Name: historique_abonnements_id_histo_abo_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_historique_abonnements ALTER COLUMN id_histo_abo ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.historique_abonnements_id_histo_abo_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_pays; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_pays (
                                id_pays integer NOT NULL,
                                nom_pays character varying(100) NOT NULL,
                                code_iso_pays character varying(10)
);


ALTER TABLE public.tb_pays OWNER TO akslasj;

--
-- Name: pays_id_pays_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_pays ALTER COLUMN id_pays ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pays_id_pays_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_roles; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_roles (
                                 id_role integer NOT NULL,
                                 nom_role character varying(100) NOT NULL,
                                 description_role text
);


ALTER TABLE public.tb_roles OWNER TO akslasj;

--
-- Name: roles_id_role_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_roles ALTER COLUMN id_role ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_role_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_aeroports; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_aeroports (
                                     id_ville integer NOT NULL,
                                     id_aeroport integer NOT NULL,
                                     code_iata character varying(10) NOT NULL,
                                     nom_aeroport character varying(255) NOT NULL
);


ALTER TABLE public.tb_aeroports OWNER TO akslasj;

--
-- Name: tb_annonces; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_annonces (
                                   id_annon integer NOT NULL,
                                   id_util integer NOT NULL,
                                   id_ville_dep integer NOT NULL,
                                   id_aerodep integer NOT NULL,
                                   id_ville_arr integer NOT NULL,
                                   id_aeroarr integer NOT NULL,
                                   description character varying(255),
                                   prix numeric(10,2) NOT NULL,
                                   datedepart timestamp without time zone,
                                   datearrivee timestamp without time zone,
                                   datepublication timestamp without time zone,
                                   statut character varying(50) DEFAULT 'active',
                                   titre character varying(100),
                                   CONSTRAINT tb_annonces_statut_check CHECK (((statut)::text = ANY (ARRAY[('active'::character varying)::text, ('vendue'::character varying)::text]))),
                                   CONSTRAINT tb_annonces_dates_check CHECK ((datedepart <= datearrivee)),
                                   CONSTRAINT tb_annonces_prix_check CHECK ((prix > (0)::numeric))
);


ALTER TABLE public.tb_annonces OWNER TO akslasj;

--
-- Name: tb_annonces_id_annon_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_annonces ALTER COLUMN id_annon ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tb_annonces_id_annon_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_evaluations; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_evaluations (
                                       id_util_donne integer NOT NULL,
                                       id_util_recoit integer NOT NULL,
                                       id_transa integer NOT NULL,
                                       note numeric(3,2),
                                       commentaire character varying(100),
                                       date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                       CONSTRAINT tb_evaluations_note_check CHECK ((note >= (0)::numeric AND note <= (5)::numeric))
);


ALTER TABLE public.tb_evaluations OWNER TO akslasj;

--
-- Name: tb_historique_annonces; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_historique_annonces (
                                               id_histo_annon integer NOT NULL,
                                               id_annon integer NOT NULL,
                                               id_util integer NOT NULL,
                                               id_aerodep integer NOT NULL,
                                               id_aeroarr integer NOT NULL,
                                               description character varying(255),
                                               prix numeric(10,2) NOT NULL,
                                               datedepart timestamp without time zone,
                                               datearrivee timestamp without time zone,
                                               datepublication timestamp without time zone,
                                               statut character varying(50),
                                               titre character varying(100),
                                               action_histo character varying(10) NOT NULL,
                                               CONSTRAINT chk_action_histo CHECK (((action_histo)::text = ANY (ARRAY[('insert'::character varying)::text, ('update'::character varying)::text, ('delete'::character varying)::text])))
);


ALTER TABLE public.tb_historique_annonces OWNER TO akslasj;

--
-- Name: tb_historique_annonces_id_histo_annon_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_historique_annonces ALTER COLUMN id_histo_annon ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tb_historique_annonces_id_histo_annon_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_messages; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_messages (
                                    id_msg integer NOT NULL,
                                    id_expediteur integer NOT NULL,
                                    id_destinataire integer NOT NULL,
                                    id_annon integer,
                                    contenu character varying(1000) NOT NULL,
                                    dateenvoi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
                                    url_image character varying(500)
);


ALTER TABLE public.tb_messages OWNER TO akslasj;

--
-- Name: tb_messages_id_msg_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_messages ALTER COLUMN id_msg ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tb_messages_id_msg_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_msg_lectures; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_msg_lectures (
                                        id_lecture integer NOT NULL,
                                        id_expediteur integer NOT NULL,
                                        id_destinataire integer NOT NULL,
                                        id_annon integer,
                                        dernier_acces timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tb_msg_lectures OWNER TO akslasj;

--
-- Name: msg_lectures_id_lecture_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_msg_lectures ALTER COLUMN id_lecture ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.msg_lectures_id_lecture_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_paiements; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_paiements (
                                     id_paie integer NOT NULL,
                                     id_transa integer NOT NULL,
                                     montant numeric(10,2) NOT NULL,
                                     type character varying(50) NOT NULL,
                                     statut character varying(50) NOT NULL,
                                     date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                     stripe_payment_intent_id character varying(255),
                                     stripe_charge_id character varying(255),
                                     CONSTRAINT tb_paiements_statut_check CHECK (((statut)::text = ANY (ARRAY[('attente'::character varying)::text, ('validé'::character varying)::text, ('annulé'::character varying)::text, ('remboursé'::character varying)::text]))),
                                     CONSTRAINT tb_paiements_montant_check CHECK ((montant > (0)::numeric)),
                                     CONSTRAINT tb_paiements_type_check CHECK (((type)::text = ANY (ARRAY[('carte'::character varying)::text, ('virement'::character varying)::text, ('especes'::character varying)::text, ('autre'::character varying)::text])))
);


ALTER TABLE public.tb_paiements OWNER TO akslasj;

--
-- Name: tb_paiements_id_paie_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_paiements ALTER COLUMN id_paie ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tb_paiements_id_paie_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_transactions; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_transactions (
                                        id_transa integer NOT NULL,
                                        id_payeur integer NOT NULL,
                                        id_receveur integer NOT NULL,
                                        id_annon integer,
                                        montant numeric(10,2) NOT NULL,
                                        statut character varying(50) NOT NULL,
                                        date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                        CONSTRAINT tb_transactions_statut_check CHECK (((statut)::text = ANY (ARRAY[('attente'::character varying)::text, ('validée'::character varying)::text, ('annulée'::character varying)::text, ('remboursée'::character varying)::text]))),
                                        CONSTRAINT tb_transactions_montant_check CHECK ((montant > (0)::numeric))
);


ALTER TABLE public.tb_transactions OWNER TO akslasj;

--
-- Name: tb_transactions_id_transa_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_transactions ALTER COLUMN id_transa ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tb_transactions_id_transa_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tb_types_abonnement; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_types_abonnement (
                                            id_type_abonnement integer NOT NULL,
                                            nom_type character varying(100) NOT NULL,
                                            prix numeric(10,2) NOT NULL,
                                            duree_mois integer NOT NULL,
                                            description text,
                                            CONSTRAINT tb_types_abonnement_prix_check CHECK ((prix > (0)::numeric)),
                                            CONSTRAINT tb_types_abonnement_duree_check CHECK ((duree_mois > 0))
);


ALTER TABLE public.tb_types_abonnement OWNER TO akslasj;

--
-- Name: tb_utilisateurs; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_utilisateurs (
                                        id_util integer NOT NULL,
                                        id_ville integer NOT NULL,
                                        id_role integer NOT NULL,
                                        username character varying(255) NOT NULL,
                                        nom character varying(100) NOT NULL,
                                        prenom character varying(100) NOT NULL,
                                        email character varying(255),
                                        tel character varying(50),
                                        mot_de_passe character varying(255) NOT NULL,
                                        date_inscription timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                        piece_id character varying(100),
                                        photo character varying(255),
                                        adresse character varying(255),
                                        detail_adresse character varying(255),
                                        note_moyenne numeric(3,2) DEFAULT 0
);


ALTER TABLE public.tb_utilisateurs OWNER TO akslasj;

--
-- Name: tb_villes; Type: TABLE; Schema: public; Owner: akslasj
--

CREATE TABLE public.tb_villes (
                                  id_ville integer NOT NULL,
                                  nom_ville character varying(100) NOT NULL,
                                  id_pays integer NOT NULL
);


ALTER TABLE public.tb_villes OWNER TO akslasj;

--
-- Name: types_abonnement_id_type_abonnement_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_types_abonnement ALTER COLUMN id_type_abonnement ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.types_abonnement_id_type_abonnement_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: utilisateurs_id_util_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_utilisateurs ALTER COLUMN id_util ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.utilisateurs_id_util_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: villes_id_ville_seq; Type: SEQUENCE; Schema: public; Owner: akslasj
--

ALTER TABLE public.tb_villes ALTER COLUMN id_ville ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.villes_id_ville_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: tb_abonnements; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_abonnements (id_abonnement, id_util, id_type_abonnement, date_debut, date_fin) FROM stdin;
\.


--
-- Data for Name: tb_aeroports; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_aeroports (id_ville, id_aeroport, code_iata, nom_aeroport) FROM stdin;
\.


--
-- Data for Name: tb_annonces; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_annonces (id_annon, id_util, id_ville_dep, id_aerodep, id_ville_arr, id_aeroarr, description, prix, datedepart, datearrivee, datepublication, statut, titre) FROM stdin;
\.


--
-- Data for Name: tb_evaluations; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_evaluations (id_util_donne, id_util_recoit, id_transa, note, commentaire, date, note_moyenne) FROM stdin;
\.


--
-- Data for Name: tb_historique_abonnements; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_historique_abonnements (id_histo_abo, id_type_abonnement, nom_type, prix, duree_mois, description, action_histo) FROM stdin;
\.


--
-- Data for Name: tb_historique_annonces; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_historique_annonces (id_histo_annon, id_annon, id_util, id_aerodep, id_aeroarr, description, prix, datedepart, datearrivee, datepublication, statut, titre, action_histo) FROM stdin;
\.


--
-- Data for Name: tb_messages; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_messages (id_msg, id_expediteur, id_destinataire, id_annon, contenu, dateenvoi) FROM stdin;
\.


--
-- Data for Name: tb_paiements; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_paiements (id_paie, id_transa, type, statut, date) FROM stdin;
\.


--
-- Data for Name: tb_pays; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_pays (id_pays, nom_pays, code_iso_pays) FROM stdin;
\.


--
-- Data for Name: tb_roles; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_roles (id_role, nom_role, description_role) FROM stdin;
\.


--
-- Data for Name: tb_transactions; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_transactions (id_transa, id_payeur, id_receveur, id_annon, montant, statut, date) FROM stdin;
\.


--
-- Data for Name: tb_types_abonnement; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_types_abonnement (id_type_abonnement, nom_type, prix, duree_mois, description) FROM stdin;
\.


--
-- Data for Name: tb_utilisateurs; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_utilisateurs (id_util, id_ville, id_role, username, nom, prenom, email, tel, mot_de_passe, date_inscription, piece_id, photo, adresse, detail_adresse) FROM stdin;
\.


--
-- Data for Name: tb_villes; Type: TABLE DATA; Schema: public; Owner: akslasj
--

COPY public.tb_villes (id_ville, nom_ville, id_pays) FROM stdin;
\.


--
-- Name: abonnements_id_abonnement_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.abonnements_id_abonnement_seq', 1, false);


--
-- Name: historique_abonnements_id_histo_abo_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.historique_abonnements_id_histo_abo_seq', 1, false);


--
-- Name: pays_id_pays_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.pays_id_pays_seq', 1, false);


--
-- Name: roles_id_role_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.roles_id_role_seq', 1, false);


--
-- Name: tb_annonces_id_annon_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.tb_annonces_id_annon_seq', 1, false);


--
-- Name: tb_historique_annonces_id_histo_annon_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.tb_historique_annonces_id_histo_annon_seq', 1, false);


--
-- Name: tb_messages_id_msg_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.tb_messages_id_msg_seq', 1, false);


--
-- Name: tb_paiements_id_paie_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.tb_paiements_id_paie_seq', 1, false);


--
-- Name: tb_transactions_id_transa_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.tb_transactions_id_transa_seq', 1, false);


--
-- Name: types_abonnement_id_type_abonnement_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.types_abonnement_id_type_abonnement_seq', 1, false);


--
-- Name: utilisateurs_id_util_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.utilisateurs_id_util_seq', 1, false);


--
-- Name: villes_id_ville_seq; Type: SEQUENCE SET; Schema: public; Owner: akslasj
--

SELECT pg_catalog.setval('public.villes_id_ville_seq', 1, false);


--
-- Name: tb_abonnements abonnements_id_util_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_abonnements
    ADD CONSTRAINT abonnements_id_util_key UNIQUE (id_util);


--
-- Name: tb_abonnements abonnements_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_abonnements
    ADD CONSTRAINT abonnements_pkey PRIMARY KEY (id_abonnement);


--
-- Name: tb_aeroports aeroports_code_iata_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_aeroports
    ADD CONSTRAINT aeroports_code_iata_key UNIQUE (code_iata);


--
-- Name: tb_aeroports aeroports_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_aeroports
    ADD CONSTRAINT aeroports_pkey PRIMARY KEY (id_ville, id_aeroport);


--
-- Name: tb_evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id_util_donne, id_util_recoit, id_transa);


--
-- Name: tb_historique_abonnements historique_abonnements_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_historique_abonnements
    ADD CONSTRAINT historique_abonnements_pkey PRIMARY KEY (id_histo_abo);


--
-- Name: tb_pays pays_code_iso_pays_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_pays
    ADD CONSTRAINT pays_code_iso_pays_key UNIQUE (code_iso_pays);


--
-- Name: tb_pays pays_nom_pays_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_pays
    ADD CONSTRAINT pays_nom_pays_key UNIQUE (nom_pays);


--
-- Name: tb_pays pays_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_pays
    ADD CONSTRAINT pays_pkey PRIMARY KEY (id_pays);


--
-- Name: tb_roles roles_nom_role_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_roles
    ADD CONSTRAINT roles_nom_role_key UNIQUE (nom_role);


--
-- Name: tb_roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_role);


--
-- Name: tb_annonces tb_annonces_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_annonces
    ADD CONSTRAINT tb_annonces_pkey PRIMARY KEY (id_annon);


--
-- Name: tb_historique_annonces tb_historique_annonces_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_historique_annonces
    ADD CONSTRAINT tb_historique_annonces_pkey PRIMARY KEY (id_histo_annon);


--
-- Name: tb_messages tb_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_messages
    ADD CONSTRAINT tb_messages_pkey PRIMARY KEY (id_msg);


--
-- Name: tb_msg_lectures msg_lectures_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_msg_lectures
    ADD CONSTRAINT msg_lectures_pkey PRIMARY KEY (id_lecture);


--
-- Name: tb_msg_lectures msg_lectures_unique; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_msg_lectures
    ADD CONSTRAINT msg_lectures_unique UNIQUE (id_expediteur, id_destinataire, id_annon);


--
-- Name: tb_paiements tb_paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_paiements
    ADD CONSTRAINT tb_paiements_pkey PRIMARY KEY (id_paie);


--
-- Name: tb_transactions tb_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_transactions
    ADD CONSTRAINT tb_transactions_pkey PRIMARY KEY (id_transa);


--
-- Name: tb_types_abonnement types_abonnement_nom_type_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_types_abonnement
    ADD CONSTRAINT types_abonnement_nom_type_key UNIQUE (nom_type);


--
-- Name: tb_types_abonnement types_abonnement_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_types_abonnement
    ADD CONSTRAINT types_abonnement_pkey PRIMARY KEY (id_type_abonnement);


--
-- Name: tb_utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- Name: tb_utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id_util);


--
-- Name: tb_utilisateurs utilisateurs_tel_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_tel_key UNIQUE (tel);


--
-- Name: tb_utilisateurs utilisateurs_username_key; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_username_key UNIQUE (username);


--
-- Name: tb_villes villes_pkey; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_villes
    ADD CONSTRAINT villes_pkey PRIMARY KEY (id_ville);


--
-- Name: tb_villes villes_nom_pays_unique; Type: CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_villes
    ADD CONSTRAINT villes_nom_pays_unique UNIQUE (nom_ville, id_pays);


--
-- Name: tb_abonnements abonnements_id_type_abonnement_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_abonnements
    ADD CONSTRAINT abonnements_id_type_abonnement_fkey FOREIGN KEY (id_type_abonnement) REFERENCES public.tb_types_abonnement(id_type_abonnement);


--
-- Name: tb_abonnements abonnements_id_util_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_abonnements
    ADD CONSTRAINT abonnements_id_util_fkey FOREIGN KEY (id_util) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_aeroports aeroports_id_ville_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_aeroports
    ADD CONSTRAINT aeroports_id_ville_fkey FOREIGN KEY (id_ville) REFERENCES public.tb_villes(id_ville);


--
-- Name: tb_evaluations evaluations_id_util_donne_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_evaluations
    ADD CONSTRAINT evaluations_id_util_donne_fkey FOREIGN KEY (id_util_donne) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_evaluations evaluations_id_util_recoit_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_evaluations
    ADD CONSTRAINT evaluations_id_util_recoit_fkey FOREIGN KEY (id_util_recoit) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_annonces fk_annon_aero_arr; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_annonces
    ADD CONSTRAINT fk_annon_aero_arr FOREIGN KEY (id_ville_arr, id_aeroarr) REFERENCES public.tb_aeroports(id_ville, id_aeroport);


--
-- Name: tb_annonces fk_annon_aero_part; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_annonces
    ADD CONSTRAINT fk_annon_aero_part FOREIGN KEY (id_ville_dep, id_aerodep) REFERENCES public.tb_aeroports(id_ville, id_aeroport);


--
-- Name: tb_historique_annonces fk_histo_annon_annon; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_historique_annonces
    ADD CONSTRAINT fk_histo_annon_annon FOREIGN KEY (id_annon) REFERENCES public.tb_annonces(id_annon);


--
-- Name: tb_historique_abonnements historique_abonnements_id_type_abonnement_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_historique_abonnements
    ADD CONSTRAINT historique_abonnements_id_type_abonnement_fkey FOREIGN KEY (id_type_abonnement) REFERENCES public.tb_types_abonnement(id_type_abonnement);


--
-- Name: tb_annonces tb_annonces_id_util_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_annonces
    ADD CONSTRAINT tb_annonces_id_util_fkey FOREIGN KEY (id_util) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_messages tb_messages_id_annon_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_messages
    ADD CONSTRAINT tb_messages_id_annon_fkey FOREIGN KEY (id_annon) REFERENCES public.tb_annonces(id_annon);


--
-- Name: tb_messages tb_messages_id_destinataire_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_messages
    ADD CONSTRAINT tb_messages_id_destinataire_fkey FOREIGN KEY (id_destinataire) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_messages tb_messages_id_expediteur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_messages
    ADD CONSTRAINT tb_messages_id_expediteur_fkey FOREIGN KEY (id_expediteur) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_msg_lectures msg_lectures_id_expediteur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_msg_lectures
    ADD CONSTRAINT msg_lectures_id_expediteur_fkey FOREIGN KEY (id_expediteur) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_msg_lectures msg_lectures_id_destinataire_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_msg_lectures
    ADD CONSTRAINT msg_lectures_id_destinataire_fkey FOREIGN KEY (id_destinataire) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_msg_lectures msg_lectures_id_annon_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_msg_lectures
    ADD CONSTRAINT msg_lectures_id_annon_fkey FOREIGN KEY (id_annon) REFERENCES public.tb_annonces(id_annon);


--
-- Name: tb_paiements tb_paiements_id_transa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_paiements
    ADD CONSTRAINT tb_paiements_id_transa_fkey FOREIGN KEY (id_transa) REFERENCES public.tb_transactions(id_transa);


--
-- Name: tb_transactions tb_transactions_id_annon_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_transactions
    ADD CONSTRAINT tb_transactions_id_annon_fkey FOREIGN KEY (id_annon) REFERENCES public.tb_annonces(id_annon);


--
-- Name: tb_transactions tb_transactions_id_payeur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_transactions
    ADD CONSTRAINT tb_transactions_id_payeur_fkey FOREIGN KEY (id_payeur) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_transactions tb_transactions_id_receveur_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_transactions
    ADD CONSTRAINT tb_transactions_id_receveur_fkey FOREIGN KEY (id_receveur) REFERENCES public.tb_utilisateurs(id_util);


--
-- Name: tb_utilisateurs utilisateurs_id_role_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_id_role_fkey FOREIGN KEY (id_role) REFERENCES public.tb_roles(id_role);


--
-- Name: tb_utilisateurs utilisateurs_id_ville_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_utilisateurs
    ADD CONSTRAINT utilisateurs_id_ville_fkey FOREIGN KEY (id_ville) REFERENCES public.tb_villes(id_ville);


--
-- Name: tb_villes villes_id_pays_fkey; Type: FK CONSTRAINT; Schema: public; Owner: akslasj
--

ALTER TABLE ONLY public.tb_villes
    ADD CONSTRAINT villes_id_pays_fkey FOREIGN KEY (id_pays) REFERENCES public.tb_pays(id_pays);


--
-- Name: idx_messages_expediteur_destinataire; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_messages_expediteur_destinataire ON public.tb_messages USING btree (id_expediteur, id_destinataire);


--
-- Name: idx_messages_annonce; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_messages_annonce ON public.tb_messages USING btree (id_annon);


--
-- Name: idx_messages_dateenvoi; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_messages_dateenvoi ON public.tb_messages USING btree (dateenvoi DESC);


--
-- Name: idx_msg_lectures_destinataire; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_msg_lectures_destinataire ON public.tb_msg_lectures USING btree (id_destinataire);


--
-- Name: idx_msg_lectures_conversation; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_msg_lectures_conversation ON public.tb_msg_lectures USING btree (id_expediteur, id_destinataire, id_annon);


--
-- Name: idx_roles_nom; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_roles_nom ON public.tb_roles USING btree (nom_role);


--
-- Name: idx_pays_nom; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_pays_nom ON public.tb_pays USING btree (nom_pays);


--
-- Name: idx_pays_code; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_pays_code ON public.tb_pays USING btree (code_iso_pays);


--
-- Name: idx_villes_pays; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_villes_pays ON public.tb_villes USING btree (id_pays);


--
-- Name: idx_villes_nom; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_villes_nom ON public.tb_villes USING btree (nom_ville);


--
-- Name: idx_aeroports_nom; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_aeroports_nom ON public.tb_aeroports USING btree (nom_aeroport);


--
-- Name: idx_aeroports_code_iata; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_aeroports_code_iata ON public.tb_aeroports USING btree (code_iata);


--
-- Name: idx_utilisateurs_role; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_utilisateurs_role ON public.tb_utilisateurs USING btree (id_role);


--
-- Name: idx_utilisateurs_ville; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_utilisateurs_ville ON public.tb_utilisateurs USING btree (id_ville);


--
-- Name: idx_utilisateurs_date_inscription; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_utilisateurs_date_inscription ON public.tb_utilisateurs USING btree (date_inscription DESC);


--
-- Name: idx_utilisateurs_note_moyenne; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_utilisateurs_note_moyenne ON public.tb_utilisateurs USING btree (note_moyenne DESC);


--
-- Name: idx_annonces_utilisateur; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_utilisateur ON public.tb_annonces USING btree (id_util);


--
-- Name: idx_annonces_aerodep; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_aerodep ON public.tb_annonces USING btree (id_aerodep);


--
-- Name: idx_annonces_aeroarr; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_aeroarr ON public.tb_annonces USING btree (id_aeroarr);


--
-- Name: idx_annonces_statut; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_statut ON public.tb_annonces USING btree (statut);


--
-- Name: idx_annonces_datedepart; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_datedepart ON public.tb_annonces USING btree (datedepart);


--
-- Name: idx_annonces_datepublication; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_datepublication ON public.tb_annonces USING btree (datepublication DESC);


--
-- Name: idx_annonces_prix; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_annonces_prix ON public.tb_annonces USING btree (prix);


--
-- Name: idx_histo_annonces_annonce; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_annonces_annonce ON public.tb_historique_annonces USING btree (id_annon);


--
-- Name: idx_histo_annonces_utilisateur; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_annonces_utilisateur ON public.tb_historique_annonces USING btree (id_util);


--
-- Name: idx_histo_annonces_action; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_annonces_action ON public.tb_historique_annonces USING btree (action_histo);


--
-- Name: idx_histo_annonces_date; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_annonces_date ON public.tb_historique_annonces USING btree (datepublication DESC);


--
-- Name: idx_types_abo_prix; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_types_abo_prix ON public.tb_types_abonnement USING btree (prix);


--
-- Name: idx_types_abo_duree; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_types_abo_duree ON public.tb_types_abonnement USING btree (duree_mois);


--
-- Name: idx_abonnements_type; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_abonnements_type ON public.tb_abonnements USING btree (id_type_abonnement);


--
-- Name: idx_abonnements_date_debut; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_abonnements_date_debut ON public.tb_abonnements USING btree (date_debut);


--
-- Name: idx_abonnements_date_fin; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_abonnements_date_fin ON public.tb_abonnements USING btree (date_fin);


--
-- Name: idx_histo_abo_type; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_abo_type ON public.tb_historique_abonnements USING btree (id_type_abonnement);


--
-- Name: idx_histo_abo_action; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_histo_abo_action ON public.tb_historique_abonnements USING btree (action_histo);


--
-- Name: idx_evaluations_recoit; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_evaluations_recoit ON public.tb_evaluations USING btree (id_util_recoit);


--
-- Name: idx_evaluations_donne; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_evaluations_donne ON public.tb_evaluations USING btree (id_util_donne);


--
-- Name: idx_evaluations_transaction; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_evaluations_transaction ON public.tb_evaluations USING btree (id_transa);


--
-- Name: idx_evaluations_date; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_evaluations_date ON public.tb_evaluations USING btree (date DESC);


--
-- Name: idx_evaluations_note; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_evaluations_note ON public.tb_evaluations USING btree (note DESC);


--
-- Name: idx_transactions_payeur; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_transactions_payeur ON public.tb_transactions USING btree (id_payeur);


--
-- Name: idx_transactions_receveur; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_transactions_receveur ON public.tb_transactions USING btree (id_receveur);


--
-- Name: idx_transactions_annonce; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_transactions_annonce ON public.tb_transactions USING btree (id_annon);


--
-- Name: idx_transactions_date; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_transactions_date ON public.tb_transactions USING btree (date DESC);


--
-- Name: idx_transactions_statut; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_transactions_statut ON public.tb_transactions USING btree (statut);


--
-- Name: idx_paiements_transaction; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_paiements_transaction ON public.tb_paiements USING btree (id_transa);


--
-- Name: idx_paiements_date; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_paiements_date ON public.tb_paiements USING btree (date DESC);


--
-- Name: idx_paiements_statut; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_paiements_statut ON public.tb_paiements USING btree (statut);


--
-- Name: idx_paiements_stripe_intent; Type: INDEX; Schema: public; Owner: akslasj
--

CREATE INDEX idx_paiements_stripe_intent ON public.tb_paiements USING btree (stripe_payment_intent_id);


--
-- Name: update_note_moyenne(); Type: FUNCTION; Schema: public; Owner: akslasj
--

CREATE OR REPLACE FUNCTION update_note_moyenne()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id INTEGER;
BEGIN
  -- Déterminer l'utilisateur à mettre à jour
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.id_util_recoit;
  ELSE
    target_user_id := NEW.id_util_recoit;
  END IF;

  -- Calculer et mettre à jour la moyenne (1 décimale)
  UPDATE tb_utilisateurs
  SET note_moyenne = COALESCE((
    SELECT ROUND(AVG(note)::numeric, 1)
    FROM tb_evaluations
    WHERE id_util_recoit = target_user_id
      AND note IS NOT NULL
  ), 0)
  WHERE id_util = target_user_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;


--
-- Name: trg_update_note_moyenne; Type: TRIGGER; Schema: public; Owner: akslasj
--

CREATE TRIGGER trg_update_note_moyenne
AFTER INSERT OR UPDATE OR DELETE ON tb_evaluations
FOR EACH ROW
EXECUTE FUNCTION update_note_moyenne();


--
-- PostgreSQL database dump complete
--

\unrestrict FFO1FOp07Q1CzUwYWuroUYPnWpixykg4KmU4GQyQUp1Ya0762dvgZqb7jAwUgeY

