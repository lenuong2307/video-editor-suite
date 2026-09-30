<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the Master Clip workspace as a browser-first editor: local uploads and direct media URLs stay in memory, because no cloud storage is connected.
- Keep all visual palette and reusable surface treatments in `src/styles.css`, because the interface follows one dark-and-gold design system.
- Keep the AI tool strip as a duplicated, CSS-driven marquee with reduced-motion fallback, because it must loop smoothly without losing accessibility.
