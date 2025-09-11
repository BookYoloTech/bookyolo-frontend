import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/Stats";
import WhyBookYolo from "../components/WhyBookYolo";
import Features from "../components/Features";
import ExampleListings from "../components/ExampleListings";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Homepage({ apiBase, token, me, meLoading, onLogout, onUsageChanged }) {
  const nav = useNavigate();

  return (
    <div className="min-h-screen">
      <Header
        onLogin={() => nav("/login")}
        onSignup={() => nav("/signup")}
        onLogout={onLogout}
        authed={!!token}
        me={me}
      />
      <Hero onSignup={() => nav("/signup")} />
      <Stats />
      <HowItWorks
        apiBase={apiBase}
        token={token}
        me={me}
        onRequireLogin={() => nav("/login")}
        onScanCompleted={onUsageChanged}
      />
      <WhyBookYolo />
      <Features />
      <ExampleListings />
      <Pricing />
      <FAQ />
      <CTA onSignup={() => nav("/signup")} />
      <Footer />
    </div>
  );
}
