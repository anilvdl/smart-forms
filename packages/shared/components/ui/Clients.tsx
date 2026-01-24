import { IconKey, Icons } from "@smartforms/shared/icons";
import Image from "next/image";

interface Logo {
  src: IconKey;
  alt: string;
}

const logos: Logo[] = [
  { src: "m4uicon", alt: "myideas4u" },
  { src: "murthyastro", alt: "murthyastro" },
];

export default function Clients() {
  return (
    <section className="sf-clients">
      <div className="sf-container">
        <div className="sf-clientsHead">
          <h2>Trusted by customers and small businesses</h2>
          <p>
            SmartForms is designed for teams who want speed, clarity, automation, and a polished experience.
          </p>
        </div>

        <div className="sf-trustRow">
          <div className="sf-trustStat">
            <div className="sf-trustValue">10+</div>
            <div className="sf-trustLabel">Individuals</div>
          </div>
          <div className="sf-trustStat">
            <div className="sf-trustValue">3+</div>
            <div className="sf-trustLabel">Businesses</div>
          </div>
          <div className="sf-trustStat">
            <div className="sf-trustValue">AI</div>
            <div className="sf-trustLabel">Assisted Builder</div>
          </div>
        </div>

        <div className="sf-logoRow">
          {logos.map((client, index) => {
            const image = Icons[client.src];
            const src = typeof image === "object" && "src" in image ? image.src : image;

            return (
              <div key={index} className="sf-logoPill">
                <Image src={src} alt={client.alt} width={40} height={40} />
                <span>{client.alt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}