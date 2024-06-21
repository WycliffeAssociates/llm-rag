# An Evaluation of Retrieval-augmented generation on Scripture Assistant

## Introduction
LLMs demonstrated remarkable capabilities in understanding and generating human-like text, thereby transforming various sectors including healthcare, finance, and customer service. Despite their impressive performance, LLMs face significant limitations, particularly in terms of generating factually accurate and contextually relevant information consistently.

This white paper focuses on evaluating the performance of RAG, RAG-Fusion in particular, compared to traditional LLMs. Through a detailed analysis, we aim to examine how RAG enhances the capabilities of LLMs, providing empirical evidence and practical insights into its effectiveness.

The chat API we created was based on RAG-Fusion [2402.03367 (arxiv.org)](https://arxiv.org/pdf/2402.03367) technique. 
<diagram>

### 1. Multiple query generation
This approach leverages different variations of the original query to improve the retrieval quality. The query is first sent to the LLM to generate several sub-queries with similar interest. The template for generating multiple queries defines as: 
```
You are a helpful assistant that generates multiple search queries based on a single input query. \n
Generate multiple search queries related to: {question} \n
Output (4 queries):
```
The generated queries along with the original will be forwarded to the next step: retrieval.

### 2. Context Retrieval
Vector database is a crucial component of RAG. It enables the retrieval mechanism to gather relevant information which is known as "context" that enhances the generation process of LLMs. In this paper, we use Chroma vector database to manage the data sources for our RAG system. We outline the database construction as follow:
- Data sources preparation and standardization.
- Embedding: we use OpenAI text embedding model that converts text data into multi-dimensional vectors. These vectors are indexed and linked with relevant metadata.
- Retrieval: each query will be converted to a vector space which will be used to search for similar vectors in the database. For improved efficiency, multiple queries are executed in parallel. The results will be returned as a collection of documents with the highest similarity scores.

### 3. Context Ranking
We followed RAG-Fusion approach by performing reciprocal rank fusion (RRF). This is a common technique used in evaluating and ranking the search results based on the computed scores.
<formula>

After the result set is ranked by descending similarity, the top-n documents along with the original query are sent to the LLM in a formatted prompt.
```
Answer the following question based on this context:    
{context}.

Question: {question}
```

### Prompt Engineering - Guidance conditions

Prompt engineering involves constructing and refining the input prompts given to LLMs to "steer" the response toward desirable output. In the context of RAG, this also means guiding the LLM generation toward the most relevant information and reducing the probability of irrelevant information. [2310.03184 (arxiv.org)](https://arxiv.org/pdf/2310.03184) describes the relevance of the response to the retrieval context as groundedness. 

For prompts with no guidance, the response came back irrelevant for most of the in-depth questions about a specific domain.
Low guidance, ...
High guidance, ...

## Limitations
One of the biggest drawbacks when using RAG Fusion, as outlined in the [paper](https://arxiv.org/pdf/2402.03367), is the performance. Traditional LLMs queries normally take a fraction of the delay of RAG responses. This is due to the additional query generation step and the embedded context documents to the second query to the LLM.

## Future work

## Conclusion
By providing a thorough assessment of RAG's performance, this white paper seeks to contribute to the ongoing discourse on enhancing AI-driven text generation. It aims to equip stakeholders with the knowledge and insights necessary to make informed decisions about adopting and implementing RAG in their AI systems.
