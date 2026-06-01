# Admin demo media (optional overrides)

By default the API serves **Amharic demo** PDF/audio when a book has no upload.

Set these in the backend `.env` to use your own files:

- `DEMO_AMHARIC_PDF_URL`
- `DEMO_AMHARIC_AUDIO_URL`
- `DEMO_OROMO_PDF_URL`
- `DEMO_OROMO_AUDIO_URL`

You can also place files here and point env vars to your admin app, e.g. `http://localhost:3002/demo/amharic-manuscript.pdf`.
