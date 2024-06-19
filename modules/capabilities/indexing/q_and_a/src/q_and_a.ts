import { Indexer } from "@itsmworkbench/indexing";
import * as XLSX from "xlsx";

type QandADetails = {
  file: string
  index: string;
  fileName: string;
  questionsColumn: string;
  answersColumn: string;
  enabledColumn: string;
  id_column: string;
  headers: number;
};

export type RowData = {
  index: number;
  question: string;
  answer: string;
  enabled: string;
};

const loadExcelData = ({
  fileName,
  questionsColumn,
  answersColumn,
  enabledColumn,
  id_column,
}: QandADetails): RowData[] => {
  // Read the Excel file
  const workbook = XLSX.readFile(fileName);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON
  const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

  // Find the column indexes based on the header row
  const headerRow = jsonData[0];
  const questionColIndex = headerRow.indexOf(questionsColumn);
  const answerColIndex = headerRow.indexOf(answersColumn);
  const enabledColIndex = headerRow.indexOf(enabledColumn);
  const id_codeIndex = headerRow.indexOf(id_column);

  console.log(jsonData);

  if (
    questionColIndex === -1 ||
    answerColIndex === -1 ||
    enabledColIndex === -1 ||
    id_codeIndex === -1
  ) {
    throw new Error("One or more columns not found in the Excel file.");
  }

  // Extract data from the specified columns
  const rowData: RowData[] = jsonData.slice(1).map((row: any[]) => ({
    index: row[id_codeIndex],
    question: row[questionColIndex],
    answer: row[answerColIndex],
    enabled: row[enabledColIndex],
  }));

  const enabledRows = rowData.filter((row) => row.enabled === "yes");

  return enabledRows;
};

// separate function for indexing question and answer

export const indexQandA =
  (indexerFn: (fileTemplate: string, indexId: string) => Indexer<any>) =>
  async (details: QandADetails) => {
    const excelData = loadExcelData(details);
    console.log(excelData);
    const indexer = indexerFn( details.file, details.index);
    await indexer.start(details.index);
    console.log(details);
    try {
      for (const row of excelData) {
        await indexer.processLeaf(
          details.index,
          row.index.toString()
        )({
          question: row.question,
          answer: row.answer,
        });
      }

      await indexer.finished(details.index);
    } catch (e) {
      indexer.failed(details.index, e);
    }
  };
