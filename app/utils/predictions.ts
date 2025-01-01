'use client'

import * as tf from '@tensorflow/tfjs'
import { SalesData } from '../actions/process-sales-data'

export async function predictSales(salesData: SalesData[], daysToPredict: number): Promise<{[key: string]: number[]}> {
  await tf.ready();
  
  const articles = Array.from(new Set(salesData.map(d => d.article)));
  const predictions: {[key: string]: number[]} = {};

  for (const article of articles) {
    const articleData = salesData
      .filter(d => d.article === article)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(d => d.sales);

    const model = tf.sequential();
    model.add(tf.layers.dense({units: 1, inputShape: [1]}));
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

    const xs = tf.tensor2d(articleData.slice(0, -1), [articleData.length - 1, 1]);
    const ys = tf.tensor2d(articleData.slice(1), [articleData.length - 1, 1]);

    await model.fit(xs, ys, {epochs: 100});

    const lastValue = tf.tensor2d([articleData[articleData.length - 1]], [1, 1]);
    const prediction = model.predict(lastValue) as tf.Tensor;
    const predictedValues = [prediction.dataSync()[0]];

    for (let i = 1; i < daysToPredict; i++) {
      const nextPrediction = model.predict(tf.tensor2d([predictedValues[i-1]], [1, 1])) as tf.Tensor;
      predictedValues.push(nextPrediction.dataSync()[0]);
    }

    predictions[article] = predictedValues.map(v => Math.round(v));
  }

  return predictions;
}

