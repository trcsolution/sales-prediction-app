'use client'

import * as tf from '@tensorflow/tfjs'
import { SalesData } from '../actions/process-sales-data'

interface EnhancedSalesData extends SalesData {
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
}

function enhanceData(data: SalesData[]): EnhancedSalesData[] {
  return data.map(item => {
    const date = new Date(item.date);
    return {
      ...item,
      dayOfWeek: date.getDay(),
      dayOfMonth: date.getDate(),
      month: date.getMonth() + 1,
    };
  });
}

export async function predictSales(salesData: SalesData[], daysToPredict: number, startDate: string): Promise<SalesData[]> {
  await tf.ready();

  const enhancedData = enhanceData(salesData);
  const articles = Array.from(new Set(enhancedData.map(d => d.article)));
  const predictions: SalesData[] = [];

  const startDateObj = new Date(startDate);

  for (const article of articles) {
    const articleData = enhancedData
      .filter(d => d.article === article && new Date(d.date) < startDateObj)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (articleData.length > 0) {
      const xsTrain = articleData.map(d => [d.dayOfWeek, d.dayOfMonth, d.month]);
      const ysTrain = articleData.map(d => d.sales);

      console.log(`Training data for ${article}:`, { xsTrain, ysTrain });

      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 8, activation: 'relu', inputShape: [3] }));
      model.add(tf.layers.dense({ units: 1 }));
      model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

      const xs = tf.tensor2d(xsTrain);
      const ys = tf.tensor1d(ysTrain);

      await model.fit(xs, ys, { epochs: 100, verbose: 1 });

      for (let i = 0; i < daysToPredict; i++) {
        const predictionDate = new Date(startDateObj);
        predictionDate.setDate(predictionDate.getDate() + i);

        const input = tf.tensor2d([[
          predictionDate.getDay(),
          predictionDate.getDate(),
          predictionDate.getMonth() + 1
        ]]);

        const prediction = model.predict(input) as tf.Tensor;
        const salesPrediction = prediction.dataSync()[0];

        console.log(`Raw prediction for ${article} on ${predictionDate.toISOString().split('T')[0]}:`, salesPrediction);

        const validSalesPrediction = Math.max(0, Math.round(salesPrediction));

        predictions.push({
          date: predictionDate.toISOString().split('T')[0],
          article,
          sales: validSalesPrediction
        });

        input.dispose();
        prediction.dispose();
      }

      xs.dispose();
      ys.dispose();
      model.dispose();
    } else {
      for (let i = 0; i < daysToPredict; i++) {
        const predictionDate = new Date(startDateObj);
        predictionDate.setDate(predictionDate.getDate() + i);
        predictions.push({
          date: predictionDate.toISOString().split('T')[0],
          article,
          sales: 0
        });
      }
    }
  }

  console.log('Final predictions:', predictions);

  return predictions;
}

