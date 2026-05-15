-- Enforce altText minimum 30 chars for IMAGE figures
ALTER TABLE "Figure"
  ADD CONSTRAINT "figure_image_alt_text_min_length"
  CHECK (kind <> 'IMAGE' OR (char_length("altText") >= 30));

-- Enforce body max 600 chars for ReaderNote
ALTER TABLE "ReaderNote"
  ADD CONSTRAINT "reader_note_body_max_length"
  CHECK (char_length(body) <= 600);
