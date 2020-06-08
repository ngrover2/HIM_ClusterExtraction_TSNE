# A Visualisation tool using React and D3: A human-in-the-middle approach to interactively extract clusters from a text corpus
An interactive visualisation tool using React and D3 that runs in the browser and allows a researcher observe the convergence of high-dimensional data using the T-SNE algorithm. The visualisation provides interactive controls to interact with data points, extract clusters, remove noise and save at the back-end.

![TSNE Visualisation - Head Image](/TSNEAllWithoutSave.png)

In supervised Machine Learning classification, we have access to predefined labels/target values for each data point which let us train a Machine Learning model that can later be used to infer the class of new/unseen data points. In the absence of labels for data points, a machine learning model can no longer be trained directly. Instead, we use unsupervised learning techniques and algorithms to try to segregate the data into various clusters. Since there is no ground truth available with which to measure the quality of clusters produced by the algorithm, a human has to jump in to to do that job. 

Check out the demo [here](http://www.navitgrover.xyz/him-tsne)
__Note: The demo may not be available right now as it is hosted on free tier.__

Most real-world data have more dimensions than what can be plotted on a 2D or 3D screen, which is why researchers often use dimensionality reduction techniques like PCA, MDS, TSNE etc. to project the data from an n-dimensional space to a 2 or 3-dimensional space and then look for visual cues that indicate the presence of any underlying clusters in the data.

The researcher in this case benefits greatly from visualisation tools that let him interact with the data and help him create clusters right there in the visualisation interface. In this report, we created a visualisation template using d3.js for just that purpose. This tool can help a researcher identify and save interesting clusters in the data in two ways. 

* First, it uses tSNE to project the data from an n-dimensional space to the 2-dimensional space. The tSNE algorithm tries to learn the lower dimensional mapping of the data from its original high-dimensional space which is a highly iterative process. Our visualisation shows not just the final result but all the intermediate states as the data is being transformed. This may be useful, for example, to look for patterns that occur in any of the intermediate representations of the projection that may later be obscured in the final mapping.

* Secondly, at each stage of the tSNE iteration, the researcher can pause the process and extract a subset of the data points in a separate interface and interact with it. This is useful to identify small clusters in the data, clean them by removing noise, add a label for them as a group and save them. The researcher has complete control over which points to include/exclude in specific clusters by way of various interactive actions, thus giving him/her finer control.

![TSNE Visualisation - Introduction to the tool - first image (both views)](/TSNECombined.png)

## Data Format

The visualisation is powered by D3.js (authored by [Mike Bostock](https://en.wikipedia.org/wiki/Mike_Bostock)). It expects as input a json file - containing NxN pair-wise word-vector distances (i.e. each word vector's distance to all other word vectors). The distances between words is computed using a word-embedding algorithm, such as Word2Vec, which learns word vectors from a text corpus such that the vectors encode relationship between words.

Then, using the tsne.js library (authored by [Andrej Karpathy](http://karpathy.github.io/)), T-SNE algorithm is run to project the high-dimensional word-vectors onto 2d space. The positions of words are updated after each iteration.The algorithm can be paused/reset at any time using the controls on top. D3's force simulation is used to decide and configure how long (# of iterations) the T-SNE algorithm will run. 

## Other Interactions

Merely pausing the convergence simulation is of not much use. That is why the visualisation provides several controls to help the user/researcher interact with the word clusters in varioous ways, like - extract clusters, examine them, remove noise, identify stop words, name clusters etc.

The visualisation is divided into two panes - __TSNE Simulation__ pane on the left and a __Cluster Examination__ pane on the right. The user selects a cluster that he/she is interested in from the simulation pane via a lasso extraction feature. It activates when the user “clicks and holds”, then moves the cursor to encompass the words in a loop and “releases” when lasso loop is complete. The selected words are automatically brought into the examination pane (see below). The words just extracted are also highlighted in teh simulation pane to help the user identify words that have been extracted before. 

![TSNE Visualisation - Introduction to the tool - second image](/TSNEAllWithoutSave.png)

Due to the limited interactivity of a point and click device like a mouse, the click action's behavior depends on the currently active mode. The modes affects how individual words are interacted with. There are four modes provided:

* __NORMAL__ mode: While this mode is active, the user can safely use the mouse without worrying about what a click action on a word object will do as nothing happens when user clicks on a word object in this mode. it is the default active mode. 

![TSNE Visualisation - Right View normal mode](/TSNERight1.png)

* __REMOVE__ mode: This mode is used to facilitate removing noise words from the view so that the user is not distracted from them. The user clicks on the invidual word objects to remove them from the view. 

* ___MARK__ mode: This mode is useful when the user wants to differentiate some words from others while examination. When a word is clicked on in this mode, its color changes to denote that it has been marked. 

![TSNE Visualisation - Mark Mode first image](/TSNEMarkMode1.png)

![TSNE Visualisation - Mark Mode second image](/TSNEMarkMode2.png)

* __CHOOSE CENTRE__ mode: This mode is purely for aesthetics. There is an interaction feature called “Arraneg Radially” which arranges the words into a radial formation. When a user clicks on a word in this mode, this word would be placed at the centre of the radial formation. 

![TSNE Visualisation - ChooseCentreMode](/TSNEChooseCentreMode.png)

## Word Group Interactions

Apart from the interactions on individual word-level, there are some controls provided that take some action on all/some group of words in the examination pane. Important ones among them are:

* __Hide Marked__: Temporarily hide the marked ones from the view.
* __Unhide Marked__: Un-hide the temporarily hidden marked words.
* __Hide UnMarked__: Similar to Hide Marked, but works on the unmarked ones.
* __Unhide Marked__: Similar to UnHide Marked, but works on the unmarked ones.
* __Scatter__: Scatter the words using a force simulation
* __Arrange Radially__: Arrange the words into a radial formation
* __Reset State__: Reset the words, forgetting all examination state like marked words, and start with fresh examination. This could be useful if words were mistakenly removed OR initial actions were meant to be experimental.

## Save Words Interaction

Finally, there are a couple of controls that help extract the clusters and save them to a permanent storage. I coded the extracted words to be saved to an Elasticsearch index, but they can be put anywhere as these controls merely pass the extracted words and other metadata to a REST API endpoint. The user can choose which words to save by making a choice between either of - the words that have been marked, ones that are unmarked, ones that were removed or all words. 

![TSNE Visualisation - Save Words Cluster as a Topic](/TSNEAllWithSave.png)



![TSNE Visualisation - Save Stop Words](/TSNESaveStopWords.png)
