import Image from "next/image";
import { PageMain } from "@/components/page-main";
import { NoteHost } from "@/components/note-host";
import { AnnotatedText } from "@/components/annotated-text";
import { MarginaliaAnchor } from "@/components/marginalia";
import { SocialLinks } from "@/components/social-links";
import { PageBody } from "@/components/page-body";
import { emptyNote, mergeNote } from "@/lib/notes";
import { getStoredNotes } from "@/lib/note-store";
import { getStoredPages } from "@/lib/page-store";
import { homeBioBody } from "@/lib/home";
import { splitChunks } from "@/lib/writing";

export default async function Page() {
  const stored = await getStoredNotes();
  const noteFor = (id: string) => mergeNote(emptyNote(id), stored[id]);

  // The bio: the owner's stored copy over the static default, split into
  // paragraphs on blank lines (same convention as post bodies).
  const pages = await getStoredPages();
  const bioBody = pages["home"]?.body ?? homeBioBody;
  const bio = splitChunks(bioBody);

  return (
    // On mobile the page is a flex column filling the remaining viewport, with
    // no bottom padding, so the photo can anchor flush to the page's end.
    <PageMain className="flex flex-1 flex-col pb-0 lg:block lg:pb-6">
      {/* The photo owns the lower-right corner here, so the margin panel
          moves to the bottom of the content column. */}
      <MarginaliaAnchor position="content-left" />
      <div className="max-w-[40rem]">
        <PageBody id="home" body={bioBody} label="edit bio">
          <div className="space-y-6">
            {bio.map((paragraph, index) => (
              <NoteHost key={paragraph} as="div" note={noteFor(`bio:${index}`)}>
                <p className={index === 0 ? "copy-20" : "copy-18"}>
                  <AnnotatedText text={paragraph} stored={stored} />
                </p>
              </NoteHost>
            ))}
          </div>
        </PageBody>
      </div>

      {/* Mobile order: socials come before the photo so she sits at the very
          bottom of the page. On lg the socials live in the rail (this footer
          is hidden) and the photo is pinned to the corner. */}
      <footer className="mt-12 lg:hidden">
        <SocialLinks horizontal />
      </footer>

      {/* Mobile: mt-auto pins the photo to the bottom of the page (pt-10
          keeps a minimum gap below the socials). On lg this wrapper is fixed
          to the corner and shrink-wraps the photo. */}
      <div className="mt-auto pt-10 lg:fixed lg:-bottom-[8vh] lg:-right-[4vw] lg:mt-0 lg:pt-0">
        <div className="relative">
          <Image
            src="/images/site/linda-4.png"
            alt="Linda as a kid"
            width={1000}
            height={1000}
            priority
            className="block h-auto w-auto max-w-[16rem] select-none lg:h-[78vh] lg:w-auto lg:max-w-none"
          />
          {/* The PNG is a square canvas with lots of transparent padding; the
              subject's opaque pixels span x 29%–74.6%. This hitbox carries the
              note handlers so hover/keybind only trigger over her, not the
              empty corners of the image box. */}
          <NoteHost
            as="div"
            note={noteFor("photo:baby")}
            className="absolute inset-y-0 left-[29%] right-[25%]"
          />
        </div>
      </div>
    </PageMain>
  );
}
