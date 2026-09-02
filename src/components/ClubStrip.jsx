import { useApp } from "../context/AppContext.jsx";



export default function ClubStrip() {

  const { proposedClubs, voteClub, setActiveTab } = useApp();



  if (proposedClubs.length === 0) return null;



  return (

    <section className="bg-white border-b border-stone-200 py-4 shrink-0">

      <div className="flex items-center justify-between px-4 mb-3">

        <h2 className="text-sm font-semibold text-stone-800">Navrhované kluby</h2>

        <button

          type="button"

          onClick={() => setActiveTab("groups")}

          className="text-xs font-semibold text-teal-700 hover:text-teal-800"

        >

          Všechny

        </button>

      </div>

      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide">

        {proposedClubs.map((club) => {

          const full = club.votes >= club.required;

          const pct = Math.min(100, (club.votes / club.required) * 100);

          return (

            <article

              key={club.id}

              className="shrink-0 w-[220px] bg-stone-50 border border-stone-200 rounded-2xl p-4"

            >

              <span className="inline-block text-[10px] font-semibold text-teal-800 bg-teal-200 px-2 py-0.5 rounded-lg mb-2">

                {club.tag}

              </span>

              <p className="text-sm font-medium text-stone-800 leading-snug mb-3">{club.name}</p>

              <div className="mb-2">

                <div className="flex justify-between text-[11px] text-stone-500 mb-1">

                  <span>

                    {club.votes} / {club.required} hlasů

                  </span>

                </div>

                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">

                  <div

                    className="h-full bg-teal-700 rounded-full transition-all duration-500"

                    style={{ width: `${pct}%` }}

                  />

                </div>

              </div>

              <button

                type="button"

                disabled={club.voted || full}

                onClick={() => voteClub(club.id)}

                className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${

                  club.voted || full

                    ? "bg-stone-100 text-stone-400 cursor-default"

                    : "bg-teal-200 text-teal-800 hover:bg-teal-300"

                }`}

              >

                {club.voted ? "Už jsi hlasoval/a" : "To mě zajímá"}

              </button>

            </article>

          );

        })}

      </div>

    </section>

  );

}

