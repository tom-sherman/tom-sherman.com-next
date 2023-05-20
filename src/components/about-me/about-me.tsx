import { GITHUB_URL, LINKEDIN_URL, MASTODON_URL } from "@/constants";
import Image from "next/image";
import meJpg from "./me.jpg";
import styles from "./about-me.module.css";

export function Me() {
  return (
    <div className={styles.aboutMe}>
      <Image
        style={{ borderRadius: "50%", width: "10rem", height: "10rem" }}
        src={meJpg}
        alt="Tom Sherman"
      />
      <div>
        <h1>Hey 👋 I'm Tom, a Software Engineer from the UK.</h1>
        <p>
          I'm currently a Software Engineer at OVO Energy. I'm super into the
          web, functional programming, and strong type systems.
        </p>
        <p>
          You can most easily contact me on{" "}
          <a href={MASTODON_URL} rel="me">
            Mastodon
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
