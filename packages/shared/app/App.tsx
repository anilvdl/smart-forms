"use client";

import { SessionProvider, signOut } from "next-auth/react";
import type { AppProps }   from "next/app";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Head from "next/head";
import "@smartforms/shared/styles/globals.css";
import "@smartforms/shared/styles/form-builder.css";
import "@smartforms/shared/styles/PropertiesCard.css";
import "@smartforms/shared/styles/tokens.css";
import "@smartforms/shared/styles/auth.css";
import "@smartforms/shared/styles/dashboard.css";
import "@smartforms/shared/styles/navbar.css";
import "@smartforms/shared/styles/welcome.css";
import "@smartforms/shared/styles/pricing.css";
import { Icons } from "@smartforms/shared/icons";
import "react-datepicker/dist/react-datepicker.css";
// import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { useState } from "react";


export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {

  const [showModal, setShowModal] = useState(false);

  // const { extendSession } = useSessionTimeout({
  //   warningTime: 60,        // warn 1 min before expiry
  //   onWarning: () => setShowModal(true),
  //   onSessionExtended: (newExpires) => {
  //     setShowModal(false);
  //     console.log("Session extended until:", newExpires);
  //   },
  // });

  return (
    <>
      <Head>
        <title>SmartForms – Build Intelligent Forms Easily</title>
        <link rel="icon" href={Icons["forms_design"].src} type="image/png"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SmartForms is a powerful form builder for intelligent and dynamic form creation." />
      </Head>
      <SessionProvider session={pageProps.session}>
        <DndProvider backend={HTML5Backend}>
          <Component {...pageProps} />
        </DndProvider>
        {/* {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Your session is about to expire</h2>
                <p>Do you want to stay signed in?</p>
                <button onClick={() => { console.log("invoking extend session...");extendSession(); }}>
                  Extend Session
                </button>
                <button onClick={() => { setShowModal(false); signOut(); }}>
                  Log Out
                </button>
              </div>
            </div>
          )} */}
      </SessionProvider>
    </>
  );
}