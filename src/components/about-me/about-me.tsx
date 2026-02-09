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
      <div>
        <h1>Hey 👋 I'm Tom, a Principal Software Engineer from the UK.</h1>
        <p>
          I'm super into the web, functional programming, and strong type
          systems.
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
