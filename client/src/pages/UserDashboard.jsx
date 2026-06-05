import { useState } from "react";
import ComplaintForm from "../components/ComplaintForm";
import UserComplaints from "../components/UserComplaints";

function UserDashboard() {

      const [refresh , setRefresh]=useState(false);

      const triggerRefresh=()=>{
        setRefresh(prev => !prev);
      };



  return (
    <div className="container">
      <header>
        <h1 className="h1">Citizen portal</h1>
        <p className="subhead">
          Report civic issues in seconds and track progress as they’re resolved.
        </p>
      </header>

      <div style={{ height: 16 }} />

      <div className="grid-2">
        <section className="card">
          <div className="card-inner">
            <h2 className="form-title">File a complaint</h2>
            <p className="helper" style={{ marginTop: 4 }}>
              Three short steps: details, a photo, and optional map pin.
            </p>
            <ComplaintForm onSuccess={triggerRefresh} />
          </div>
        </section>

        <section className="card">
          <div className="card-inner">
            <UserComplaints refresh={refresh} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;