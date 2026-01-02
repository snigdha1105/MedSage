import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import ChatArea from "../Components/ChatArea";
import RightSidebar from "../Components/RightSidebar";
import Dashboard from "../Components/Dashboard";
import LifestyleLogger from "../Components/LifestyleLogger";
import MedicationTracker from "../Components/MedicationTracker";
import AppointmentScheduler from "../Components/AppointmentScheduler";
import MedicalReports from "../Components/MedicalReports";
import WomensHealth from "../Components/WomensHealth";
import "../styles/Dashboard.css";

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "records":
        return <MedicalReports />;
      case "care":
        return <MedicationTracker />;
      case "fitness":
        return <LifestyleLogger />;
      case "womens":
        return <WomensHealth />;
      case "reminders":
        return <AppointmentScheduler />;
      case "ai-assistant":
        return (
          <>
            <ChatArea />
            <RightSidebar />
          </>
        );
      default:
        return (
          <div className="section-placeholder">
            <h2>{activeSection.replace(/-/g, " ").toUpperCase()}</h2>
            <p>This section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onSelectSection={setActiveSection} activeSection={activeSection} />
      <div className="dashboard-main">
        {renderSection()}
      </div>
    </div>
  );
};

export default DashboardPage;
