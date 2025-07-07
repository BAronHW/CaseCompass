export const determineIfQuestion = (inputString) => {
    try {
        const questionThreshold = 20;
        let currentThresholdValue = 0;
        const lowerCaseInputString = inputString.toLowerCase();
        const arrayOfWords = lowerCaseInputString.split(" ");
        let doesSentenceContainQuestionWord = false;
        const questionWords = ['who', 'what', 'when', 'where', 'why', '?'];
        for (const word of arrayOfWords) {
            if (questionWords.includes(word)) {
                doesSentenceContainQuestionWord = true;
                currentThresholdValue += 5;
                return true;
            }
        }
        return false;
    }
    catch (error) {
        console.log('unable to run question determination module', error);
        return undefined;
    }
};
