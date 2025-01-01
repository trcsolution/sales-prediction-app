'use server'

export async function predictSales(salesData: number[]) {
  // This is a mock prediction function
  // In a real application, you would use a more sophisticated prediction model
  const sum = salesData.reduce((a, b) => a + b, 0);
  const average = sum / salesData.length;
  const prediction = average * 1.1; // Predict 10% growth

  return {
    prediction: Math.round(prediction * 100) / 100,
    historicalData: salesData
  };
}

