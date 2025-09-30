export function getResult(outcome: string | null, isWhite: boolean) {
  switch (outcome) {
    case "1-0":
      return isWhite ? "Win" : "Loss";
    case "0-1":
      return isWhite ? "Loss" : "Win";
    case "1/2-1/2":
      return "Draw";
    default:
      return "Unknown";
  }
}
