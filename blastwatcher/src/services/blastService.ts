export const predictBlastValues = async (formData: Record<string, any>): Promise<{
  predicted_ppv: number;
  predicted_sd: number;
}> => {
  try {
    console.log("Sending prediction request with data:", formData);

    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      predicted_ppv: data.predicted_ppv,
      predicted_sd: data.predicted_sd
    };
  } catch (error) {
    console.error('Error predicting blast values:', error);
    throw error;
  }
};