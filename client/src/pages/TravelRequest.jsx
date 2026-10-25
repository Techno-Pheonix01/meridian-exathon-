import { useEffect, useState } from "react"; import { useNavigate, useParams } from "react-router-dom"; import api, { err, inr } from "../services/api";
const blank = { destination: "", purpose: "", startDate: "", endDate: "", travelMode: "Flight", accommodation: { required: false, hotel: "", nights: 0 }, travelCost: "", accommodationCost: "", otherCost: "", projectCode: "" };
// Defined outside the page component so React keeps the same input mounted while you type
const F = ({ l, children }) => <div><label className="lbl">{l}</label>{children}</div>;
export default function TravelRequest() {
  const { id } = useParams(); const nav = useNavigate(); const [f, setF] = useState(blank); const [e, setE] = useState("");
  useEffect(() => { if (id) api.get("/travel/" + id).then((r) => setF({ ...r.data, startDate: r.data.startDate?.slice(0, 10), endDate: r.data.endDate?.slice(0, 10) })); }, [id]);
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value }); const acc = (k) => (ev) => setF({ ...f, accommodation: { ...f.accommodation, [k]: ev.target.value === "true" ? true : ev.target.value === "false" ? false : ev.target.value } });
  const total = (+f.travelCost || 0) + (+f.accommodationCost || 0) + (+f.otherCost || 0);
  const save = async (submit) => { setE(""); try { if (submit && (new Date(f.endDate) < new Date(f.startDate))) throw { message: "End date must be after start date" };
    const { data } = id ? await api.put("/travel/" + id, f) : await api.post("/travel", f); if (submit) await api.post(`/travel/${data._id}/submit`); nav(`/travel/${data._id}`); } catch (x) { setE(err(x)); } };
  return (<div className="card p-6 max-w-3xl"><h1 className="font-display text-2xl text-navy mb-6">New Travel Request</h1>
    <h3 className="font-medium mb-3">Trip Details</h3><div className="grid sm:grid-cols-2 gap-4 mb-6">
      <F l="Destination"><input className="inp" value={f.destination} onChange={set("destination")} /></F>
      <F l="Travel Mode"><select className="inp" value={f.travelMode} onChange={set("travelMode")}>{["Flight", "Train", "Bus", "Car", "Other"].map((m) => <option key={m}>{m}</option>)}</select></F>
      <F l="Start Date"><input type="date" className="inp" value={f.startDate} onChange={set("startDate")} /></F><F l="End Date"><input type="date" className="inp" value={f.endDate} onChange={set("endDate")} /></F>
      <div className="sm:col-span-2"><F l="Purpose of Travel"><textarea className="inp" rows="3" value={f.purpose} onChange={set("purpose")} /></F></div></div>
    <h3 className="font-medium mb-3">Accommodation</h3><div className="grid sm:grid-cols-3 gap-4 mb-6">
      <F l="Accommodation"><select className="inp" value={String(f.accommodation.required)} onChange={acc("required")}><option value="false">Not Required</option><option value="true">Required</option></select></F>
      {f.accommodation.required && <><F l="Hotel name"><input className="inp" value={f.accommodation.hotel} onChange={acc("hotel")} /></F><F l="Nights"><input type="number" min="0" className="inp" value={f.accommodation.nights} onChange={acc("nights")} /></F></>}</div>
    <h3 className="font-medium mb-3">Financial Information</h3><div className="grid sm:grid-cols-2 gap-4 mb-4">
      <F l="Estimated Travel Cost (₹)"><input type="number" min="0" className="inp" value={f.travelCost} onChange={set("travelCost")} /></F><F l="Accommodation Cost (₹)"><input type="number" min="0" className="inp" value={f.accommodationCost} onChange={set("accommodationCost")} /></F>
      <F l="Other Estimated Expenses (₹)"><input type="number" min="0" className="inp" value={f.otherCost} onChange={set("otherCost")} /></F><F l="Project / Cost Center"><input className="inp" value={f.projectCode} onChange={set("projectCode")} /></F></div>
    <div className="bg-beige rounded p-3 mb-5 flex justify-between"><span className="text-muted">Total Estimated Cost</span><b className="text-navy">{inr(total)}</b></div>
    {e && <div className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded p-2">{e}</div>}
    <div className="flex gap-3"><button className="btn2" onClick={() => save(false)}>Save Draft</button><button className="btn" onClick={() => save(true)}>Submit Request</button></div></div>);
}
