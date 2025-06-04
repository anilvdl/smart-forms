import { IconKey, Icons } from "@smartforms/shared/icons";
import Image from "next/image";

interface clientsConfigType {
  enabled: boolean;
  title: string;
  description: string;
  logos: Logo[];
}
interface Logo {
  src: IconKey;
  alt: string;
}
const clientsConfig: clientsConfigType = {
  enabled: true,
  title: "Trusted by Individual Customers and Businesses",
  description: "Over 3 businesses and 10+ individuals streamline their workflows with SmartForms.",
  logos: [
    { src: "m4uicon", alt: "myideas4u" },
    { src: "murthyastro", alt: "murthyastro" },
  ],
};

export default function Clients() {
  if (!clientsConfig.enabled) return null;

  return (
    <section className="clients bg-blue">
      <h2>{clientsConfig.title}</h2>
      <p>{clientsConfig.description}</p>
      <div className="client-logos">
        {clientsConfig.logos.map((client, index) => {
          const image = Icons[client.src];
          const src = typeof image === "object" && "src" in image ? image.src : image;

          return (
            <Image
              key={index}
              src={src}
              alt={client.alt}
              width={50}
              height={50}
            />
          );
        })}
      </div>
    </section>
  );
}