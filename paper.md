# An Evaluation of Retrieval-augmented generation on Scripture Assistant

## Introduction
LLMs demonstrated remarkable capabilities in understanding and generating human-like text, thereby transforming various sectors including healthcare, finance, and customer service. Despite their impressive performance, LLMs face significant limitations, particularly in terms of generating factually accurate and contextually relevant information consistently.

This white paper focuses on evaluating the performance of RAG, RAG-Fusion in particular, compared to traditional LLMs. Through a detailed analysis, we aim to examine how RAG enhances the capabilities of LLMs, providing empirical evidence and practical insights into its effectiveness.

The chat API we created was based on RAG-Fusion [2402.03367 (arxiv.org)](https://arxiv.org/pdf/2402.03367) technique. 
![enter image description here](https://raw.githubusercontent.com/AnonymousWalker/rag-langchain/doc/image.png)

### 1. Prompt generation
This technique leverages different variations of the original query to improve the retrieval quality. The query is first sent to the LLM to generate several sub-queries with similar interest. The template for generating multiple queries defines as: 
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
![Vector Database](https://github.com/AnonymousWalker/rag-langchain/blob/doc/vector-db.png?raw=true)

### 3. Context Ranking
We followed RAG-Fusion approach by performing reciprocal rank fusion (RRF) against the list of retrieved documents [RRF](https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking). This algorithm is commonly used in evaluating and ranking the search results based on the computed scores. The idea is that the top documents returned from across multiple queries are usually more relevant and should be ranked higher in the aggregated result.

After the result set is ranked by descending similarity, the top-n documents along with the original query are sent to the LLM in a formatted prompt.
```
Answer the following question based on this context:    
{context}.

Question: {question}
```

## Examples

Prompt engineering involves constructing and refining the input prompts given to LLMs to "steer" the response toward desirable output. In the context of RAG, this also means guiding the LLM generation toward the most relevant information and reducing the probability of irrelevant information.

For prompts with traditional LM, the responses for in-depth questions about a specific domain are more likely to be irrelevant or out-of-scope. Taking the following prompt as an example:

**Question**: Who is Stephen?  
**LM**: Stephen is a common English given name that is of Greek origin, meaning “crown” or “wreath.” It has been borne by many notable individuals throughout history, including Saint Stephen, the first Christian martyr, and Stephen Hawking, the renowned theoretical physicist.  
**RAG**: Stephen is a character mentioned in the context provided. He is described as being full of grace and power, doing great wonders and signs among the people. He is also shown to be involved in debates with certain people and eventually brought before a council.

Since the LM has not been introduced with the context of Stephen in the Scripture, it has no clue about which Stephen the prompt is referring to. When the context is presented, RAG's response brought up a more relevant answer because it has learned the content provided with the prompt.
More prompt examples are noted below when evaluating LM and RAG.

**Question**: What did Jesus say about the Holy Spirit?  
**LM**: Jesus spoke about the Holy Spirit in the Bible, particularly in the Gospel of John. He referred to the Holy Spirit as the Advocate or Comforter who would be sent by God to guide and empower believers. Jesus also promised that the Holy Spirit would teach and remind his followers of his teachings, and would testify about him. Overall, Jesus emphasized the importance of the Holy Spirit in the lives of believers for guidance, comfort, and empowerment.  
**RAG**: Jesus said that the Holy Spirit would come upon his disciples to empower them and be their Comforter. He also mentioned that the Holy Spirit is the Spirit of truth who tells God's people what is true about God so they can know Him better and serve Him well.


## Limitations
One of the biggest drawbacks when using RAG Fusion, as outlined in [paper](https://arxiv.org/pdf/2402.03367), is performance gap. Traditional LLMs queries normally take a fraction of the delay of RAG responses. This is due to the additional query generation step and the embedded context documents to the second query to the LLM.

## Future work

## Conclusion
By providing a thorough assessment of RAG's performance, this white paper seeks to contribute to the ongoing discourse on enhancing AI-driven text generation. It aims to equip stakeholders with the knowledge and insights necessary to make informed decisions about adopting and implementing RAG in their AI systems.
