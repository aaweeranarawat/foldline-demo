# Foldline: compare protein structure predictions, and see where a partner binds

Static public preview. Paste a sequence, choose up to three prediction models, and overlay their structures to see where they agree.
A second view, the **Target Explorer**, maps the residues where a partner protein contacts a target onto every predicted structure and
shows which contacts, surface residues and backbone regions hold up in each model.

**Open `index.html`** (served over HTTP) to start. Pages: `index.html` (sequence + models, and the Targets tab), `compare.html` (results for human ubiquitin), `tpd.html` (Target Explorer).

## What is real and what is not
* **Real:** the predicted structures (ESMFold, AlphaFold 2, Boltz, Chai-1) of human ubiquitin; the experimental structures (PDB 1UBQ, 5T35, 1NBF, 2D3G); the AlphaFold Database and ESMFold models of BRD4 BD2;
  all contacts, distances, surface exposure (SASA) and RMSD figures, which are computed from those coordinates (`tools/`).
* **Mock:** the "P2K-style predictions" interaction source is *synthetic*, generated from the experimental contacts plus noise and decoys to demonstrate how a predictor's output would be shown. It is labelled MOCK wherever it appears. P2K itself is not connected.
* **Not connected:** submitting a new sequence does not run a model. The progress panel is a mock-up. The Target Explorer needs an experimental complex, so it covers BRD4 x VHL and ubiquitin x USP7 / Hrs UIM in this preview.
* **Switched off in this static preview:** the AI literature assistant (it needs private API keys on a server) and importing your own structure files. Both work when you run the project with its Python server.
* The pages report geometry and model uncertainty. They do not predict binding or protein degradation.

## Run it with everything on
```
cd foldline-website
# .env with PAPERCLIP_API_KEY=...  and  ANTHROPIC_API_KEY=...   (optional: enables the literature assistant and Research mode)
python3 server.py            # http://127.0.0.1:8732
```

## Data sources and credits
PDB (RCSB), AlphaFold Protein Structure Database (EMBL-EBI), ESM Atlas (ESMFold), UniProt, Paperclip (literature search).
Models: ESMFold (Lin et al., Science 2023), AlphaFold 2 (Jumper et al., Nature 2021), Boltz (Wohlwend et al. 2024; Passaro et al. 2025), Chai-1 (Chai Discovery 2024).
UI components from React Bits (MIT + Commons Clause), Mol* viewer (MIT), GSAP and Lenis.
