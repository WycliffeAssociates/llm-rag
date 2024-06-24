# An Evaluation of Retrieval-augmented generation on Scripture Assistant

## Introduction
Large Language Model (LLM) demonstrated remarkable capabilities in understanding and generating human-like text, thereby transforming various sectors including healthcare, finance, and customer service. Despite their impressive performance, LLMs face significant limitations, particularly in terms of generating factually accurate and contextually relevant information consistently.

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

**Explanation**: Since the LM has not been introduced with the context of Stephen in the Scripture, it has no clue about which Stephen the prompt is referring to. When the context is presented, RAG's response brought up a more relevant answer because it has learned the content provided with the prompt.
More prompt examples are noted below when evaluating LM and RAG.

**Question**: What did Jesus say about the Holy Spirit?  

**LM**: Jesus spoke about the Holy Spirit in the Bible, particularly in the Gospel of John. He referred to the Holy Spirit as the Advocate or Comforter who would be sent by God to guide and empower believers. Jesus also promised that the Holy Spirit would teach and remind his followers of his teachings, and would testify about him. Overall, Jesus emphasized the importance of the Holy Spirit in the lives of believers for guidance, comfort, and empowerment.  

**RAG**: Jesus said that the Holy Spirit would come upon his disciples to empower them and be their Comforter. He also mentioned that the Holy Spirit is the Spirit of truth who tells God's people what is true about God so they can know Him better and serve Him well.

**Question**: What is truth? 

**LM**: Truth is the quality or state of being in accordance with fact or reality. It is the accurate representation of what is real or true. Truth is often considered to be objective and independent of personal beliefs or opinions.

**RAG**: The concept of truth can be understood in different contexts. In the Bible, truth is often associated with God's Word and His promises. Jesus himself claimed to be "the way, the truth, and the life" (John 14:6), emphasizing the importance of truth in the Christian faith. Truth can also refer to the reliability and accuracy of information, as well as the alignment of beliefs with reality. Ultimately, truth is a foundational principle that guides beliefs, actions, and relationships.

**Question**: How do I atone for my sins?

**LM**: Atoning for your sins can involve several steps, depending on your beliefs and the nature of your actions. Here are some general steps you can consider:. Acknowledge your sins: Recognize and take responsibility for your actions. Reflect on how your actions have impacted others and yourself. Seek forgiveness: Apologize to those you have wronged and ask for their forgiveness. This can help repair relationships and show your sincerity in wanting to make amends. Make amends: Take actions to make up for the harm you have caused. This could involve restitution, community service, or other ways to positively impact those affected by your actions. Change your behavior: Commit to making positive changes in your life to prevent repeating the same mistakes. This may involve seeking counseling, therapy, or support from others. Practice self-forgiveness: It's important to forgive yourself for your mistakes and learn from them. Holding onto guilt and shame can hinder your ability to move forward and grow. Remember that atonement is a personal journey and may look different for each individual. It's important to seek guidance from your faith tradition, spiritual leaders, or counselors if you need additional support in atoning for your sins.

**RAG**: To atone for sins according to the passages provided, one must first confess the sin that has been committed. Then, the guilty person must pay back the price of their guilt and add one-fifth more to it. If the wronged person has no close relative to receive the payment, the guilty person must pay the price for their guilt to the priest, along with a ram to atone for themselves. Additionally, offerings and sacrifices can be made to Yahweh for the forgiveness of sins. It is important to acknowledge one's transgressions, seek forgiveness, and make restitution as outlined in the passages.

**Question**: Will I go to Hell if I am a good person but don't believe that Jesus is God?

**LM**: As an AI, I cannot provide religious or spiritual advice. Beliefs about salvation and the afterlife vary among different religions and denominations. It is important to explore and understand the teachings of your own faith tradition or seek guidance from a religious leader or counselor for a more personalized answer to this question.

**RAG**: Based on the content provided, it is important to note that beliefs about Jesus being God are central to Christian theology. In the Christian faith, salvation is believed to come through faith in Jesus Christ as the Son of God and Savior. The passages emphasize the importance of faith in Christ for salvation and the consequences of unbelief. In the Christian perspective presented in the passages, it is suggested that faith in Jesus Christ is necessary for salvation. The belief that Jesus is the Son of God who suffered for the sins of humanity and was raised to life is a fundamental aspect of Christian faith. The passages also mention the consequences of unbelief, such as suffering and judgment. Therefore, according to the Christian beliefs reflected in the passages, faith in Jesus Christ as the Son of God is considered essential for salvation. Failure to believe in Jesus as God may have implications for one's spiritual destiny based on the Christian worldview presented in the text.


## Limitations
One of the biggest drawbacks when using RAG Fusion, as outlined in [paper](https://arxiv.org/pdf/2402.03367), is performance gap. Traditional LLMs queries normally take a fraction of the delay of RAG responses. This is due to the additional query generation step and the embedded context documents to the second query to the LLM.

## Future work

### Logical Routing
Our implementation of RAG currently uses a single vector database that contains the English, Spanish, and Vietnamese ULB and Translation Notes, as well as the Spanish and Vietnamese Translation Questions. To potentially improve the quality of the retrieved documents, we could split our monolithic database into several smaller, specialized databases. 

By introducing a logical routing step for each retrieval, we could direct queries to the most relevant database. Although this would increase the run-time for each query, it could enhance the relevance of the retrieved documents by reducing the retrieval of duplicate passages that are in different languages.

### RAPTOR
Given the hyperlinked structure of the Bible, if a question involves a topic that evolves over the span of multiple books, retrieving the top-k documents for a question is not always enough. One way to increase the relevance of retrieved documents in these cases is to implement RAPTOR as specified here in [paper](https://arxiv.org/pdf/2401.18059). 

RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) improves document retrieval by organizing the content like a tree, summarizing information from related sections, and then adding those summaries to the database. This method helps find more relevant answers for complex questions by allowing high-level summaries of documents to be retrieved and used as context when generating a response. 




## Conclusion
By providing a thorough assessment of RAG's performance, this white paper seeks to contribute to the ongoing discourse on enhancing AI-driven text generation. It aims to equip stakeholders with the knowledge and insights necessary to make informed decisions about adopting and implementing RAG in their AI systems.
