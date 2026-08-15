import ServicesList from "./ServicesList.jsx";



/** @deprecated Použijte GuideModule — zachováno pro zpětnou kompatibilitu */

export default function ServicesModule() {

  return (

    <div className="flex flex-col flex-1 min-h-0 px-3 py-1">

      <ServicesList />

    </div>

  );

}

