import { GITHUB_URL, LINKEDIN_URL, BLUESKY_URL } from "@/constants";
import Image from "next/image";
import meJpg from "./me.jpg";
import styles from "./about-me.module.css";

interface MeProps {
  imagePriority?: boolean;
}

export function Me({ imagePriority }: MeProps) {
  return (
    <div className={styles.aboutMe}>
      <Image
        style={{ borderRadius: "50%", width: "10rem", height: "10rem" }}
        src={meJpg}
        alt="Tom Sherman"
        priority={imagePriority}
      />
      <div>
        <h1>Hey 👋 I'm Tom, a Software Engineer from the UK.</h1>
        <p>
          I'm currently a Software Engineer at OVO Energy. I'm super into the
          web, functional programming, and strong type systems.
        </p>
        <p>
          You can most easily contact me on{" "}
          <a href={BLUESKY_URL} rel="me">
            Bluesky
          </a>{" "}
          but I'm also on{" "}
          <a href="https://twitter.com/tomus_sherman">Twitter</a>,{" "}
          <a href={LINKEDIN_URL}>LinkedIn</a>, and{" "}
          <a href={GITHUB_URL}>GitHub</a>.
        </p>
      </div>
    </div>
  );
}
