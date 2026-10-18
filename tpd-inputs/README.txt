Inputs for the BRD4 bromodomain-2 predictions the Target Explorer is waiting for
==============================================================================
Sequence: UniProt O60885 (BRD4) residues 333-465 = 133 aa (BD2 plus flanking residues; the explorer crops the models to 349-459
to match the experimental structure PDB 5T35, so flanks only help the termini fold sensibly).

Files
  BRD4_BD2_333-465.fasta   generic FASTA (AlphaFold 2 / ColabFold / ESMFold)
  chai_BRD4_BD2.fasta      Chai-1 header style  (>protein|name=...)
  boltz_BRD4_BD2.fasta     Boltz header style   (>A|protein|  - run with its MSA server option, or give an MSA yourself)

Where to put the results (any of .pdb / .cif; the first/best model is used; the page works out the residue numbering itself):
  foldline-website/data/raw/tpd/models/chai.cif     (or chai.pdb)
  foldline-website/data/raw/tpd/models/boltz.cif    (or boltz.pdb)
  foldline-website/data/raw/tpd/models/alphafold.pdb   OPTIONAL: your own AlphaFold 2 run replaces the AlphaFold DB model
  foldline-website/data/raw/tpd/models/esmfold.pdb     OPTIONAL: replaces the ESM Atlas model
Then run:   /usr/local/bin/python3 foldline-website/tools/build_tpd.py      (and refresh the page)

Notes: per-residue confidence is read from the B-factor column (0-100 or 0-1 are both handled). Please note the model version / settings
somewhere (for example in the file name or a text file next to it) so the methods section can cite them.
