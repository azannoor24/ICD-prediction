# ICD Prediction Project Structure

## Folder Organization

```
project/
├── data/                          # Data files
│   ├── ICD10codes.csv            # ICD-10 code database (tracked in git)
│   ├── icd_stage1.faiss          # FAISS index (local only)
│   ├── icd_stage1_records.json   # FAISS records (local only)
│   ├── icd_full.faiss            # Full FAISS index (local only)
│   └── icd_full_records.json     # Full FAISS records (local only)
│
├── models/                        # Model files
│   └── checkpoints/              # Model checkpoints
│
├── utils/                         # Utility files and reports
│   └── report.txt                # Sample medical report for testing
│
├── results/                       # Output files
│   ├── prediction.json           # Prediction results
│   └── prediction_evaluation.json # Evaluation results
│
├── logs/                          # Application logs
├── notebooks/                     # Jupyter notebooks
│
├── icd.py                         # Main prediction script
├── .env                           # Environment variables (API keys)
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

## Updated File Paths in icd.py

### Data Files
- `DEFAULT_CSV` → `data/ICD10codes.csv`
- `FAISS_INDEX_FILE` → `data/icd_stage1.faiss`
- `FAISS_RECORDS_FILE` → `data/icd_stage1_records.json`
- `FAISS_FULL_FILE` → `data/icd_full.faiss`
- `FAISS_FULL_REC_FILE` → `data/icd_full_records.json`

### Output Files
- Default output → `results/prediction.json`
- Evaluation output → `results/prediction_evaluation.json`

### Input Files
- Demo report → `utils/report.txt` (auto-loaded if exists)

## Running the Script

### Basic prediction on utils/report.txt:
```bash
python icd.py
```

### Prediction with custom report:
```bash
python icd.py --file utils/report.txt --backend gemini
```

### Save prediction to results:
```bash
python icd.py --file utils/report.txt --output results/prediction.json --backend gemini
```

### Run evaluation:
```bash
python icd.py --eval --backend gemini
```

### Rebuild FAISS cache:
```bash
python icd.py --rebuild-cache --backend gemini
```

## Git Tracking

**Tracked in Git:**
- `icd.py` - Main script
- `.env` - Environment configuration
- `.gitignore` - Git rules
- `data/ICD10codes.csv` - ICD-10 database

**NOT Tracked (local only):**
- `data/*.faiss` - Large FAISS indices
- `data/*.json` - FAISS records
- `results/` - All output files
- `logs/` - Application logs
- `models/checkpoints/` - Model files
