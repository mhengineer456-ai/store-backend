-- Run this in MySQL Workbench to create the weight_capture table
-- Database: newdata

USE newdata;

CREATE TABLE IF NOT EXISTS weight_capture (
  id               INT PRIMARY KEY AUTO_INCREMENT,
  materialCode     VARCHAR(50)   NOT NULL,
  materialName     VARCHAR(255)  NOT NULL,
  unit             VARCHAR(30)   DEFAULT 'Pcs',
  category         VARCHAR(100)  DEFAULT '',
  supplier         VARCHAR(255)  DEFAULT '',
  lotNo            VARCHAR(100)  DEFAULT '',
  poNumber         VARCHAR(100)  DEFAULT '',
  invoiceNo        VARCHAR(100)  DEFAULT '',
  storeLocation    VARCHAR(255)  DEFAULT '',
  storeIncharge    VARCHAR(255)  DEFAULT '',
  grossWeightKg    DOUBLE        DEFAULT 0,
  tareWeightKg     DOUBLE        DEFAULT 0,
  netWeightKg      DOUBLE        DEFAULT 0,
  weightPerPieceG  DOUBLE        DEFAULT 0,
  pieces           INT           DEFAULT 0,
  packets          INT           DEFAULT 1,
  barcodeId        VARCHAR(100)  DEFAULT '',
  status           VARCHAR(50)   DEFAULT 'Captured',
  remarks          TEXT,
  capturedAt       DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Verify table was created
SELECT 'weight_capture table created successfully!' AS result;
DESCRIBE weight_capture;
