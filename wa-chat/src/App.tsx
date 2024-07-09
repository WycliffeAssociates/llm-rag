import React, { useState } from 'react';
import { Typography, Grid, TextField, Button, Accordion, AccordionSummary, AccordionDetails, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Markdown from 'react-markdown'

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('');
  const [llmOutput, setLlmOutput] = useState('');
  const [ragOutput, setRagOutput] = useState('');
  const [keywords, setKeyWords] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryContent, setGlossaryContent] = useState('');


  const fetchData = async (prompt: string) => {
    try {

      const response = await fetch(`http://localhost:5000/rag?prompt=${encodeURIComponent(prompt)}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();

      setLlmOutput(result['llm-response']);
      setRagOutput(result['rag-response:'].response);
      setKeyWords(result['tw']);

      const combinedContext = result['rag-response:'].context
      if(typeof(combinedContext) !== "string"){
        combinedContext.map((content: unknown, index: number) => `\n\n======================== Context ${index + 1} ========================\n\n${content}`)
        .join('\n');

        setContext(combinedContext)
      }


    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    fetchData(userInput);
  };

  const handleAccordionToggle = () => {
    setExpanded(!expanded);
  };

  const handleOpenDialog = (content: React.SetStateAction<string>, title: string) => {
    setDialogTitle(title)
    setDialogContent(content);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent('');
  };

  const handleOpenGlossary = (content: React.SetStateAction<string>) => {
    // removes urls from markdown text 
    const body = content.toString().replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    console.log(body)
    setGlossaryContent(body);
    setGlossaryOpen(true);
  }

  const handleCloseGlossary = () => {
    setGlossaryOpen(false);
    setGlossaryContent('');
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h4" align="center" gutterBottom>
          LLM vs. RAG
        </Typography>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} sm={8}>
              <TextField
                id="userInput"
                name="user_input"
                label="Ask a question here..."
                variant="outlined"
                fullWidth
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>

      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={5}>
          <Typography variant="h5" align="center" gutterBottom>
            ChatGPT
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <TextField
              id="llmOutput"
              variant="outlined"
              multiline
              rows={10}
              fullWidth
              value={llmOutput}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={() => handleOpenDialog(llmOutput, "LLM")}>
              <OpenInFullIcon />
            </IconButton>
          </div>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="h5" align="center" gutterBottom>
            RAG
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <TextField
              id="ragOutput"
              variant="outlined"
              multiline
              rows={10}
              fullWidth
              value={ragOutput}
              InputProps={{
                readOnly: true,
              }}
            />
            <IconButton onClick={() => handleOpenDialog(ragOutput, "LLM + RAG")}>
              <OpenInFullIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <Grid container spacing={2} justifyContent="center" style={{ margin: '10px', gap: '20px' }}>
        {Object.entries(keywords).map(([key, _], index) => (
              <a href={`javascript:void(0)`} onClick={() => handleOpenGlossary(keywords[key])}>
                  {key}
                </a>
          ))}
      </Grid>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={10} style={{ marginTop: '20px' }}>
          <Accordion expanded={expanded} onChange={handleAccordionToggle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {expanded ? 'Hide Context' : 'Show Context'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                <TextField
                  id="extraContext"
                  variant="outlined"
                  multiline
                  rows={6}
                  fullWidth
                  value={context}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <IconButton onClick={() => handleOpenDialog(context, "Context")}>
                  <OpenInFullIcon />
                </IconButton>
              </div>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        }}>
          <CircularProgress />
        </div>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="lg">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
              {dialogContent}
          </Typography>
        </DialogContent>
      </Dialog>

      <Dialog id="glossary-view" open={glossaryOpen} onClose={handleCloseGlossary} fullWidth maxWidth="lg">
        <DialogContent>
          <Typography variant="body1">
            <Markdown>
              {glossaryContent}
            </Markdown>
          </Typography>
        </DialogContent>
      </Dialog>
    </Grid>
  );
};

export default App;



// const exampleOutput = {
//   "llm-response": "The Day of Pentecost is a Christian holiday that commemorates the descent of the Holy Spirit upon the apostles and other followers of Jesus Christ, as described in the New Testament book of Acts. It is celebrated 50 days after Easter Sunday and is often referred to as the birthday of the Christian Church.",
//   "rag-response:": {
//     "context": [
//       "He will speak to you a message by which you will be saved\u2014you and all your household.\u2019\n\n\nAs I began to speak to them, the Holy Spirit came on them, just as on us in the beginning.\n\nI remembered the words of the Lord, how he said, 'John indeed baptized with water; but you will be baptized with the Holy Spirit.'\n\n\nThen if God gave to them the same gift as he gave to us when we believed on the Lord Jesus Christ, who was I, that I could oppose God?\"\n\nWhen they heard these things, they said nothing in response, but they glorified God and said, \"Then God has given repentance for life to the Gentiles also.\"\n\n\nNow those who had been scattered by the persecution that arose over Stephen spread as far as Phoenicia, Cyprus, and Antioch, speaking the word only to Jews.\n\nBut some of them, men from Cyprus and Cyrene, came to Antioch and spoke also to Greeks, proclaiming to them the gospel about the Lord Jesus.\n\nThe hand of the Lord was with them; a great number believed and turned to the Lord.\n\n\nNews about them came to the ears of the church in Jerusalem, and they sent out Barnabas as far as Antioch.\n\nWhen he came and saw the grace of God, he was glad and he encouraged them all to remain with the Lord with purpose of heart.",
//       "# praising God and having favor with all the people\n\n\"praising God. All the people approved of them\"\n\n# those who were being saved\n\nThis can be stated in active form. Alternate translation: \"those whom the Lord saved\" (See: [[rc://en/ta/man/jit/figs-activepassive]])\n\n# Acts 02 General Notes\n\n## Structure and formatting\n\nSome translations set poetry farther to the right than the rest of the text to show that it is poetry. The ULB does this with the poetry that is quoted from the Old Testament in 2:17-21, 25-28, and 34-35.\n\nSome translations set quotations from the Old Testament farther to the right on the page than the rest of the text. The ULB does this with the quoted material in 2:31.\n\nThe events described in this chapter are commonly called \"Pentecost.\" Many people believe that the church began to exist when the Holy Spirit came to live inside believers at Pentecost.\n\n## Special concepts in this chapter\n\n### Tongues",
//       "Khi Sa-mu-\u00ean d\u00e2ng c\u1ee7a l\u1ec5 thi\u00eau xong, ng\u01b0\u1eddi Phi-li-tin k\u00e9o \u0111\u1ebfn g\u1ea7n \u0111\u1eb7ng t\u1ea5n c\u00f4ng Y-s\u01a1-ra-\u00ean; nh\u01b0ng \u0110\u1ee9c Gi\u00ea-h\u00f4-va n\u1ed5i ti\u1ebfng s\u1ea5m s\u00e9t th\u1eadt l\u1edbn trong ng\u00e0y \u1ea5y ngh\u1ecbch c\u00f9ng d\u00e2n Phi-li-tin r\u1ed3i khi\u1ebfn ch\u00fang r\u01a1i v\u00e0o c\u1ea3nh l\u1ed9n x\u1ed9n, v\u00e0 ch\u00fang b\u1ecf ch\u1ea1y tr\u01b0\u1edbc m\u1eb7t Y-s\u01a1-ra-\u00ean.",
//       "you yourselves know the events that took place, which occurred throughout all Judea, beginning in Galilee, after the baptism that John announced;\n\nthe events concerning Jesus of Nazareth, how God anointed him with the Holy Spirit and with power. He went about doing good and healing all who were oppressed by the devil, for God was with him.\n\n\nWe are witnesses of all the things Jesus did, both in the country of the Jews and in Jerusalem. They killed him by hanging him on a tree,\n\nbut God raised him up on the third day and caused him to be seen,\n\nnot by all the people, but to the witnesses who were chosen beforehand by God\u2014by us who ate and drank with him after he rose from the dead.\n\n\nHe commanded us to proclaim to the people and to testify that this is the one who has been chosen by God to be the Judge of the living and the dead.\n\nAbout him all the prophets testify, that everyone who believes in him receives forgiveness of sins through his name.\"\n\n\nWhile Peter was still saying these things, the Holy Spirit fell on all of those who were listening to his message.\n\nThe people who belonged to the circumcision group of believers\u2014all of those who came with Peter\u2014were amazed, because the gift of the Holy Spirit was poured out also on the Gentiles.",
//       "C\u00e1c m\u00f4n \u0111\u1ed3 nh\u00f3m h\u1ecdp c\u00f9ng nhau v\u00e0o ng\u00e0y l\u1ec5 Ng\u0169 Tu\u1ea7n.\n\n\n# Nh\u1eefng ng\u01b0\u1eddi Do Th\u00e1i tin k\u00ednh c\u00f3 m\u1eb7t t\u1ea1i Gi\u00ea-ru-sa-lem v\u00e0o th\u1eddi \u0111i\u1ec3m n\u00e0y \u0111\u1ebfn t\u1eeb \u0111\u00e2u?\n\nNh\u1eefng ng\u01b0\u1eddi Do Th\u00e1i tin k\u00ednh \u0111\u1ebfn t\u1eeb m\u1ecdi n\u01b0\u1edbc tr\u00ean th\u1ebf gi\u1edbi.\n\n\n# Phi-e-r\u01a1 n\u00f3i \u0111i\u1ec1u g\u00ec \u0111\u01b0\u1ee3c \u1ee9ng nghi\u1ec7m v\u00e0o th\u1eddi \u0111i\u1ec3m \u0111\u00f3?",
//       "Parthians and Medes and Elamites, and those who live in Mesopotamia, in Judea and Cappadocia, in Pontus and Asia,\n\nPhrygia and Pamphylia, in Egypt and the parts of Libya toward Cyrene, and visitors from Rome,\n\nJews and proselytes, Cretans and Arabians, we hear them telling in our languages about the mighty works of God.\"\n\n\nThey were all amazed and perplexed; they said to one another, \"What does this mean?\"\n\nBut others mocked and said, \"They are full of new wine.\"\n\n\nBut Peter stood with the eleven, raised his voice, and declared to them, \"Men of Judea and all of you who live at Jerusalem, let this be known to you; pay attention to my words.\n\nFor these people are not drunk as you assume, for it is only the third hour of the day.\n\n\nBut this is what was spoken through the prophet Joel:\n\n'It will be in the last days,' God says,\n 'I will pour out my Spirit on all flesh.\n Your sons and your daughters will prophesy,\n your young men will see visions,\n and your old men will dream dreams.\n\n\nSurely on my servants and my female servants in those days\n I will pour out my Spirit, and they will prophesy.",
//       "H\u00f4m \u0111\u00f3 h\u1ecd d\u00e2ng nhi\u1ec1u c\u1ee7a l\u1ec5 v\u00e0 vui m\u1eebng, v\u00ec \u0110\u1ee9c Ch\u00faa Tr\u1eddi \u0111\u00e3 ban cho h\u1ecd ni\u1ec1m vu h\u1edbn h\u1edf. Ph\u1ee5 n\u1eef v\u00e0 tr\u1ebb con c\u0169ng vui m\u1eebng. Ti\u1ebfng vui m\u1eebng c\u1ee7a Gi\u00ea-ru-sa-lem vang \u0111\u1ebfn t\u1eadn xa.",
//       "V\u00ec nh\u1eefng l\u1eddi ng\u01b0\u1eddi \u0111\u00e3 n\u00f3i khi l\u1edbn ti\u1ebfng d\u00f9ng l\u1eddi c\u1ee7a \u0110\u1ee9c Gi\u00ea-h\u00f4-va n\u00f3i ngh\u1ecbch b\u00e0n th\u1edd t\u1ea1i B\u00ea-t\u00ean v\u00e0 ngh\u1ecbch c\u00f9ng c\u00e1c b\u00e0n th\u1edd \u1edf nh\u1eefng \u0111i\u1ec7n th\u1edd trong c\u00e1c th\u00e0nh \u1edf x\u1ee9 Sa-ma-ri, ch\u1eafc ch\u1eafn s\u1ebd x\u1ea3y \u0111\u1ebfn.",
//       "This implies that Peter had not finished speaking but had intended to say more.\n\n# the Holy Spirit came on them, just as on us in the beginning\n\nPeter leaves out some things to keep the story short. Alternate translation: \"the Holy Spirit came on the Gentile believers, just as he came on the Jewish believers at Pentecost\" (See: [[rc://en/ta/man/jit/figs-ellipsis]])\n\n# in the beginning\n\nPeter is referring to the day of Pentecost.\n\n# you will be baptized with the Holy Spirit\n\nThis can be stated in active form. Alternate translation: \"God will baptize you with the Holy Spirit\" (See: [[rc://en/ta/man/jit/figs-activepassive]])\n\n# General Information:\n\nThe word \"them\" refers to Cornelius and his Gentile guests and household. The word \"us\" refers to the speaker and his hearers and so is inclusive. (See: [[rc://en/ta/man/jit/figs-exclusive]])\n\n# Connecting Statement:\n\nPeter finishes his speech (which he began in [Acts 11:4](../11/04.md)) to the Jews about his vision and about what had happened at the house of Cornelius.",
//       "\u00ca-x\u00ea-chia n\u00f3i kh\u00edch l\u1ec7 nh\u1eefng ng\u01b0\u1eddi L\u00ea-vi n\u00e0o hi\u1ec3u r\u00f5 s\u1ef1 th\u1edd ph\u01b0\u1ee3ng \u0110\u1ee9c Gi\u00ea-h\u00f4-va. V\u1eady, h\u1ecd \u0111\u00e3 \u0103n l\u1ec5 trong b\u1ea3y ng\u00e0y, d\u00e2ng c\u00e1c th\u1ee9 con sinh thu\u1ed9c c\u1ee7a l\u1ec5 t\u01b0\u01a1ng giao, v\u00e0 \u0111\u01b0a ra l\u1eddi x\u01b0ng t\u1ed9i v\u1edbi Gi\u00ea-h\u00f4-va \u0110\u1ee9c Ch\u00faa Tr\u1eddi c\u1ee7a t\u1ed5 ph\u1ee5 m\u00ecnh.",
//       "For David did not ascend to the heaven, but he says,\n 'The Lord said to my Lord, \"Sit at my right hand\n\nuntil I make your enemies the footstool for your feet.\"'\n\nTherefore, let all the house of Israel certainly know that God has made him both Lord and Christ, this Jesus whom you crucified.\"\n\n\nNow when they heard this, they were pierced in their hearts, and said to Peter and the rest of the apostles, \"Brothers, what must we do?\"\n\nThen Peter said to them, \"Repent and be baptized, each of you, in the name of Jesus Christ for the forgiveness of your sins, and you will receive the gift of the Holy Spirit.\n\nFor the promise is to you and to your children and to all who are far off, as many people as the Lord our God will call.\"\n\n\nWith many other words he testified and exhorted them, saying, \"Be saved from this perverse generation.\"\n\nThen they received his word and were baptized, and there were added in that day about three thousand souls.\n\nThey devoted themselves to the apostles' teaching and fellowship, in the breaking of bread and in prayers.\n\n\nFear came upon every soul, and many wonders and signs were done through the apostles.\n\nAll who believed were together and had all things in common,",
//       "T\u1ea5t c\u1ea3 h\u1ecd \u0111\u01b0\u1ee3c \u0111\u1ea7y d\u1eaby Th\u00e1nh Linh v\u00e0 b\u1eaft \u0111\u1ea7u n\u00f3i nh\u1eefng ng\u00f4n ng\u1eef kh\u00e1c, t\u00f9y theo Th\u00e1nh Linh cho h\u1ecd n\u00f3i.\n\n\nL\u00fac \u0111\u00f3, t\u1ea1i th\u00e0nh Gi\u00ea-ru-sa-lem, c\u00f3 nh\u1eefng ng\u01b0\u1eddi Giu-\u0111a tin k\u00ednh \u0111\u1ebfn t\u1eeb c\u00e1c n\u01b0\u1edbc tr\u00ean th\u1ebf gi\u1edbi. \n\nKhi nghe th\u1ea5y \u00e2m thanh \u0111\u00f3, c\u1ea3 \u0111\u00e1m \u0111\u00f4ng ch\u1ea1y l\u1ea1i v\u00e0 r\u1ea5t hoang mang b\u1edfi v\u00ec m\u1ed7i ng\u01b0\u1eddi \u0111\u1ec1u nghe c\u00e1c m\u00f4n \u0111\u1ed3 \u0111ang n\u00f3i ng\u00f4n ng\u1eef c\u1ee7a m\u00ecnh.",
//       "Th\u00e1ng hai n\u0103m th\u1ee9 hai, sau khi v\u1ec1 \u0111\u1ebfn nh\u00e0 \u0110\u1ee9c Ch\u00faa Tr\u1eddi t\u1ea1i Gi\u00ea-ru-sa-lem, X\u00ea-ru-ba-b\u00ean, Gi\u00ea-sua con Gi\u00f4-xa-\u0111\u00e1c, nh\u1eefng th\u1ea7y t\u1ebf l\u1ec5 c\u00f2n l\u1ea1i, ng\u01b0\u1eddi L\u00ea-vi, v\u00e0 nh\u1eefng ng\u01b0\u1eddi phu t\u00f9 tr\u1edf v\u1ec1 Gi\u00ea-ru-sa-lem b\u1eaft \u0111\u1ea7u c\u00f4ng vi\u1ec7c. H\u1ecd giao nh\u1eefng ng\u01b0\u1eddi L\u00ea-vi t\u1eeb hai m\u01b0\u01a1i tu\u1ed5i tr\u1edf l\u00ean coi s\u00f3c c\u00f4ng vi\u1ec7c trong nh\u00e0 \u0110\u1ee9c Gi\u00ea-h\u00f4-va.",
//       "D\u01b0\u1edbi quy\u1ec1n ng\u01b0\u1eddi l\u00e0 \u00ca-\u0111en, Min-gia-min, Gi\u00ea-sua, S\u00ea-ma-gia, A-ma-ria, v\u00e0 S\u00ea-ca-nia, \u1edf trong c\u00e1c th\u00e0nh th\u1ea7y t\u1ebf l\u1ec5. H\u1ecd c\u00f3 ch\u1ee9c s\u1eafc \u0111\u00e1ng tin c\u1eady, lo ph\u00e2n ph\u00e1t c\u00e1c l\u1ec5 v\u1eadt \u1ea5y cho anh em m\u00ecnh, t\u1eebng ban th\u1ee9 m\u1ed9t, d\u00f9 quan tr\u1ecdng hay kh\u00f4ng quan tr\u1ecdng."
//     ],
//     "response": "The day of Pentecost is commonly believed to be the day when the church began to exist, as it is when the Holy Spirit came to live inside believers."
//   }
// }
