//http://github.com/maritz/js-double-metaphone/raw/master/double-metaphone.js
// This is a very rough common.js transformation of a php implementation. Original copyright of the PHP implementation follows:


// VERSION DoubleMetaphone Class 1.01
//
// DESCRIPTION
// 
//   This class implements a "sounds like" algorithm developed
//   by Lawrence Philips which he published in the June, 2000 issue
//   of C/C++ Users Journal.  Double Metaphone is an improved
//   version of Philips' original Metaphone algorithm.
// 
// COPYRIGHT
// 
//   Copyright 2001, Stephen Woodbridge <woodbri@swoodbridge.com>
//   All rights reserved.
//
//   http://swoodbridge.com/DoubleMetaPhone/
//
//   This PHP translation is based heavily on the C implementation
//   by Maurice Aubrey <maurice@hevanet.com>, which in turn  
//   is based heavily on the C++ implementation by
//   Lawrence Philips and incorporates several bug fixes courtesy
//   of Kevin Atkinson <kevina@users.sourceforge.net>.
// 
//   This module is free software; you may redistribute it and/or
//   modify it under the same terms as Perl itself.
// 
// CONTRIBUTIONS
//
//   17-May-2002 Geoff Caplan  http://www.advantae.com
//     Bug fix: added code to return class object which I forgot to do
//     Created a functional callable version instead of the class version
//     which is faster if you are calling this a lot.
//
// ------------------------------------------------------------------

// TODO: this file defines a bunch of globals in it, should be converted
exports.DoubleMetaphone = function(string) {
	primary   = "";
  secondary = "";
  current   =  0;

  current  = 0;
  length   = string.length;
  last     = length - 1;
  original = string + "     ";

  original = original.toUpperCase();

  // skip this at beginning of word

  if (string_at(original, 0, 2, 
                      ['GN', 'KN', 'PN', 'WR', 'PS']))
    current++;

  // Initial 'X' is pronounced 'Z' e.g. 'Xavier'

  if (original.substr(0, 1) == 'X') {
    primary   += "S";   // 'Z' maps to 'S'
    secondary += "S";
    current++;
  }

  // main loop

  while (primary.length < 4 || secondary.length < 4) {
    if (current >= length)
      break;

    switch (original.substr(current, 1)) {
      case 'A':
      case 'E':
      case 'I':
      case 'O':
      case 'U':
      case 'Y':
        if (current == 0) {
          // all init vowels now map to 'A'
          primary   += 'A';
          secondary += 'A';
        }
        current += 1;
        break;

      case 'B':
        // '-mb', e.g. "dumb", already skipped over ...
        primary   += 'P';
        secondary += 'P';

        if (original.substr(current + 1, 1) == 'B')
          current += 2;
        else
          current += 1;
        break;

      case 'Ç':
        primary   += 'S';
        secondary += 'S';
        current += 1;
        break;

      case 'C':
        // various gremanic
        if ((current > 1) 
            && !is_vowel(original, current - 2)
            && string_at(original, current - 1, 3, 
                      ["ACH"])
            && ((original.substr(current + 2, 1) != 'I')
                && ((original.substr(current + 2, 1) != 'E')
                    || string_at(original, current - 2, 6, 
                              ["BACHER", "MACHER"])))) {

          primary   += 'K';
          secondary += 'K';
          current += 2;
          break;
        }

        // special case 'caesar'
        if ((current == 0) 
            && string_at(original, current, 6, 
                       ["CAESAR"])) {
          primary   += 'S';
          secondary += 'S';
          current += 2;
          break;
        }

        // italian 'chianti'
        if (string_at(original, current, 4, 
                       ["CHIA"])) {
          primary   += 'K';
          secondary += 'K';
          current += 2;
          break;
        }

        if (string_at(original, current, 2, 
                       ["CH"])) {

          // find 'michael'
          if ((current > 0)
              && string_at(original, current, 4, 
                       ["CHAE"])) {
            primary   += 'K';
            secondary += 'X';
            current += 2;
            break;
          }

          // greek roots e.g. 'chemistry', 'chorus'
          if ((current == 0)
              && (string_at(original, current + 1, 5, 
                       ["HARAC", "HARIS"])
                  || string_at(original, current + 1, 3, 
                            ["HOR", "HYM", "HIA", "HEM"]))
              && !string_at(original, 0, 5, ["CHORE"])) {
            primary   += 'K';
            secondary += 'K';
            current += 2;
            break;
          }

          // germanic, greek, or otherwise 'ch' for 'kh' sound
          if ((string_at(original, 0, 4, ["VAN ", "VON "])
               || string_at(original, 0, 3, ["SCH"]))
              // 'architect' but not 'arch', orchestra', 'orchid'
              || string_at(original, current - 2, 6, 
                       ["ORCHES", "ARCHIT", "ORCHID"])
              || string_at(original, current + 2, 1, 
                       ["T", "S"])
              || ((string_at(original, current - 1, 1, 
                       ["A","O","U","E"])
                   || (current == 0))
                  // e.g. 'wachtler', 'weschsler', but not 'tichner'
                  && string_at(original, current + 2, 1, 
                       ["L","R","N","M","B","H","F","V","W"," "]))) {
            primary   += 'K';
            secondary += 'K';
          } else {
            if (current > 0) {
              if (string_at(original, 0, 2, ["MC"])) {
                // e.g. 'McHugh'
                primary   += 'K';
                secondary += 'K';
              } else {
                primary   += 'X';
                secondary += 'K';
              }
            } else {
              primary   += 'X';
              secondary += 'X';
            }
          }
          current += 2;
          break;
        }

        // e.g. 'czerny'
        if (string_at(original, current, 2, ["CZ"])
            && !string_at(original, current -2, 4, 
                       ["WICZ"])) {
          primary   += 'S';
          secondary += 'X';
          current += 2;
          break;
        }

        // e.g. 'focaccia'
        if (string_at(original, current + 1, 3, 
                   ["CIA"])) {
          primary   += 'X';
          secondary += 'X';
          current += 3;
          break;
        }

        // double 'C', but not McClellan'
        if (string_at(original, current, 2, ["CC"])
            && !((current == 1) 
                 && (original.substr(0, 1) == 'M'))) {
          // 'bellocchio' but not 'bacchus'
          if (string_at(original, current + 2, 1,
                     ["I","E","H"])
              && !string_at(original, current + 2, 2,
                        ["HU"])) {
            // 'accident', 'accede', 'succeed'
            if (((current == 1)
                 && (original.substr(current - 1, 1) == 'A'))
                || string_at(original, current - 1, 5,
                          ["UCCEE", "UCCES"])) {
              primary   += "KS";
              secondary += "KS";
              // 'bacci', 'bertucci', other italian
            } else {
              primary   += "X";
              secondary += "X";
            }
            current += 3;
            break;
          } else {
            // Pierce's rule
            primary   += "K";
            secondary += "K";
            current += 2;
            break;
          }
        }

        if (string_at(original, current, 2,
                   ["CK","CG","CQ"])) {
          primary   += "K";
          secondary += "K";
          current += 2;
          break;
        }

        if (string_at(original, current, 2,
                   ["CI","CE","CY"])) {
          // italian vs. english
          if (string_at(original, current, 3,
                     ["CIO","CIE","CIA"])) {
            primary   += "S";
            secondary += "X";
          } else {
            primary   += "S";
            secondary += "S";
          }
          current += 2;
          break;
        }

        // else
        primary   += "K";
        secondary += "K";

        // name sent in 'mac caffrey', 'mac gregor'
        if (string_at(original, current + 1, 2,
                   [" C"," Q"," G"])) {
          current += 3;
        } else {
          if (string_at(original, current + 1, 1,
                     ["C","K","Q"])
              && !string_at(original, current + 1, 2,
                         ["CE","CI"])) {
            current += 2;
          } else {
            current += 1;
          }
        }
        break;

      case 'D':
        if (string_at(original, current, 2,
                   ["DG"])) {
          if (string_at(original, current + 2, 1,
                     ["I","E","Y"])) {
            // e.g. 'edge'
            primary   += "J";
            secondary += "J";
            current += 3;
            break;
          } else {
            // e.g. 'edgar'
            primary   += "TK";
            secondary += "TK";
            current += 2;
            break;
          }
        }

        if (string_at(original, current, 2,
                   ["DT","DD"])) {
          primary   += "T";
          secondary += "T";
          current += 2;
          break;
        }

        // else
        primary   += "T";
        secondary += "T";
        current += 1;
        break;

      case 'F':
        if (original.substr(current + 1, 1) == 'F')
          current += 2;
        else
          current += 1;
        primary   += "F";
        secondary += "F";
        break;

      case 'G':
        if (original.substr(current + 1, 1) == 'H') {
          if ((current > 0) 
              && !is_vowel(original, current - 1)) {
            primary   += "K";
            secondary += "K";
            current += 2;
            break;
          }

          if (current < 3) {
            // 'ghislane', 'ghiradelli'
            if (current == 0) {
              if (original.substr(current + 2, 1) == 'I') {
                primary   += "J";
                secondary += "J";
              } else {
                primary   += "K";
                secondary += "K";
              }
              current += 2;
              break;
            }
          }

          // Parker's rule (with some further refinements) - e.g. 'hugh'
          if (((current > 1)
               && string_at(original, current - 2, 1,
                         ["B","H","D"]))
              // e.g. 'bough'
              || ((current > 2)
                  &&  string_at(original, current - 3, 1,
                             ["B","H","D"]))
              // e.g. 'broughton'
              || ((current > 3)
                  && string_at(original, current - 4, 1,
                             ["B","H"]))) {
            current += 2;
            break;
          } else {
            // e.g. 'laugh', 'McLaughlin', 'cough', 'gough', 'rough', 'tough'
            if ((current > 2)
                && (original.substr(current - 1, 1) == 'U')
                && string_at(original, current - 3, 1,
                          ["C","G","L","R","T"])) {
              primary   += "F";
              secondary += "F";
            } else if ( (current > 0) && original.substr(current - 1, 1) != 'I') {
              primary   += "K";
              secondary += "K";
            }
            current += 2;
            break;
          }
        }

        if (original.substr(current + 1, 1) == 'N') {
          if ((current == 1) && is_vowel(original, 0)
              && !Slavo_Germanic(original)) {
            primary   += "KN";
            secondary += "N";
          } else {
            // not e.g. 'cagney'
            if (!string_at(original, current + 2, 2,
                        ["EY"])
                && (original.substr(current + 1) != "Y")
                && !Slavo_Germanic(original)) {
               primary   += "N";
               secondary += "KN";
            } else {
               primary   += "KN";
               secondary += "KN";
            }
          }
          current += 2;
          break;
        }

        // 'tagliaro'
        if (string_at(original, current + 1, 2,
                   ["LI"])
            && !Slavo_Germanic(original)) {
          primary   += "KL";
          secondary += "L";
          current += 2;
          break;
        }

        // -ges-, -gep-, -gel- at beginning
        if ((current == 0)
            && ((original.substr(current + 1, 1) == 'Y')
                || string_at(original, current + 1, 2,
                          ["ES","EP","EB","EL","EY","IB","IL","IN","IE",
                                "EI","ER"]))) {
          primary   += "K";
          secondary += "J";
          current += 2;
          break;
        }

        // -ger-, -gy-
        if ((string_at(original, current + 1, 2,
                    ["ER"])
             || (original.substr(current + 1, 1) == 'Y'))
            && !string_at(original, 0, 6,
                       ["DANGER","RANGER","MANGER"])
            && !string_at(original, current -1, 1,
                       ["E", "I"])
            && !string_at(original, current -1, 3,
                       ["RGY","OGY"])) {
          primary   += "K";
          secondary += "J";
          current += 2;
          break;
        }

        // italian e.g. 'biaggi'
        if (string_at(original, current + 1, 1,
                   ["E","I","Y"])
            || string_at(original, current -1, 4,
                      ["AGGI","OGGI"])) {
          // obvious germanic
          if ((string_at(original, 0, 4, ["VAN ", "VON "])
               || string_at(original, 0, 3, ["SCH"]))
              || string_at(original, current + 1, 2,
                        ["ET"])) {
            primary   += "K";
            secondary += "K";
          } else {
            // always soft if french ending
            if (string_at(original, current + 1, 4,
                       ["IER "])) {
              primary   += "J";
              secondary += "J";
            } else {
              primary   += "J";
              secondary += "K";
            }
          }
          current += 2;
          break;
        }

        if (original.substr(current +1, 1) == 'G')
          current += 2;
        else
          current += 1;

        primary   += 'K';
        secondary += 'K';
        break;

      case 'H':
        // only keep if first & before vowel or btw. 2 vowels
        if (((current == 0) || 
             is_vowel(original, current - 1))
            && is_vowel(original, current + 1)) {
          primary   += 'H';
          secondary += 'H';
          current += 2;
        } else
          current += 1;
        break;

      case 'J':
        // obvious spanish, 'jose', 'san jacinto'
        if (string_at(original, current, 4,
                   ["JOSE"])
            || string_at(original, 0, 4, ["SAN "])) {
          if (((current == 0)
               && (original.substr(current + 4, 1) == ' '))
              || string_at(original, 0, 4, ["SAN "])) {
            primary   += 'H';
            secondary += 'H';
          } else {
            primary   += "J";
            secondary += 'H';
          }
          current += 1;
          break;
        }

        if ((current == 0)
            && !string_at(original, current, 4,
                   ["JOSE"])) {
          primary   += 'J';  // Yankelovich/Jankelowicz
          secondary += 'A';
        } else {
          // spanish pron. of .e.g. 'bajador'
          if (is_vowel(original, current - 1)
              && !Slavo_Germanic(original)
              && ((original.substr(current + 1, 1) == 'A')
                  || (original.substr(current + 1, 1) == 'O'))) {
            primary   += "J";
            secondary += "H";
          } else {
            if (current == last) {
              primary   += "J";
              secondary += "";
            } else {
              if (!string_at(original, current + 1, 1,
                          ["L","T","K","S","N","M","B","Z"])
                  && !string_at(original, current - 1, 1,
                             ["S","K","L"])) {
                primary   += "J";
                secondary += "J";
              }
            }
          }
        }

        if (original.substr(current + 1, 1) == 'J') // it could happen
          current += 2;
        else 
          current += 1;
        break;

      case 'K':
        if (original.substr(current + 1, 1) == 'K')
          current += 2;
        else
          current += 1;
        primary   += "K";
        secondary += "K";
        break;

      case 'L':
        if (original.substr(current + 1, 1) == 'L') {
          // spanish e.g. 'cabrillo', 'gallegos'
          if (((current == (length - 3))
               && string_at(original, current - 1, 4,
                         ["ILLO","ILLA","ALLE"]))
              || ((string_at(original, last-1, 2,
                          ["AS","OS"])
                || string_at(original, last, 1,
                          ["A","O"]))
               && string_at(original, current - 1, 4,
                         ["ALLE"]))) {
            primary   += "L";
            secondary += "";
            current += 2;
            break;
          }
          current += 2;
        } else 
          current += 1;
        primary   += "L";
        secondary += "L";
        break;

      case 'M':
        if ((string_at(original, current - 1, 3,
                   ["UMB"])
             && (((current + 1) == last)
                 || string_at(original, current + 2, 2,
                          ["ER"])))
            // 'dumb', 'thumb'
            || (original.substr(current + 1, 1) == 'M')) {
            current += 2;
        } else {
            current += 1;
        }
        primary   += "M";
        secondary += "M";
        break;

      case 'N':
        if (original.substr(current + 1, 1) == 'N') 
          current += 2;
        else
          current += 1;
        primary   += "N";
        secondary += "N";
        break;

      case 'Ñ':
        current += 1;
        primary   += "N";
        secondary += "N";
        break;

      case 'P':
        if (original.substr(current + 1, 1) == 'H') {
          current += 2;
          primary   += "F";
          secondary += "F";
          break;
        }

        // also account for "campbell" and "raspberry"
        if (string_at(original, current + 1, 1,
                   ["P","B"]))
          current += 2;
        else
          current += 1;
        primary   += "P";
        secondary += "P";
        break;

      case 'Q':
        if (original.substr(current + 1, 1) == 'Q') 
          current += 2;
        else 
          current += 1;
        primary   += "K";
        secondary += "K";
        break;

      case 'R':
        // french e.g. 'rogier', but exclude 'hochmeier'
        if ((current == last)
            && !Slavo_Germanic(original)
            && string_at(original, current - 2, 2,
                      ["IE"])
            && !string_at(original, current - 4, 2,
                       ["ME","MA"])) {
          primary   += "";
          secondary += "R";
        } else {
          primary   += "R";
          secondary += "R";
        }
        if (original.substr(current + 1, 1) == 'R') 
          current += 2;
        else
          current += 1;
        break;

      case 'S':
        // special cases 'island', 'isle', 'carlisle', 'carlysle'
        if (string_at(original, current - 1, 3,
                   ["ISL","YSL"])) {
          current += 1;
          break;
        }

        // special case 'sugar-'
        if ((current == 0)
            && string_at(original, current, 5,
                      ["SUGAR"])) {
          primary   += "X";
          secondary += "S";
          current += 1;
          break;
        }

        if (string_at(original, current, 2,
                   ["SH"])) {
          // germanic
          if (string_at(original, current + 1, 4,
                     ["HEIM","HOEK","HOLM","HOLZ"])) {
            primary   += "S";
            secondary += "S";
          } else {
            primary   += "X";
            secondary += "X";
          }
          current += 2;
          break;
        }

        // italian & armenian 
        if (string_at(original, current, 3,
                   ["SIO","SIA"])
            || string_at(original, current, 4,
                      ["SIAN"])) {
          if (!Slavo_Germanic(original)) {
            primary   += "S";
            secondary += "X";
          } else {
            primary   += "S";
            secondary += "S";
          }
          current += 3;
          break;
        }

        // german & anglicisations, e.g. 'smith' match 'schmidt', 'snider' match 'schneider'
        // also, -sz- in slavic language altho in hungarian it is pronounced 's'
        if (((current == 0)
             && string_at(original, current + 1, 1,
                       ["M","N","L","W"]))
            || string_at(original, current + 1, 1,
                      ["Z"])) {
          primary   += "S";
          secondary += "X";
          if (string_at(original, current + 1, 1,
                      ["Z"]))
            current += 2;
          else
            current += 1;
          break;
        }

        if (string_at(original, current, 2,
                   ["SC"])) {
          // Schlesinger's rule 
          if (original.substr(current + 2, 1) == 'H')
            // dutch origin, e.g. 'school', 'schooner'
            if (string_at(original, current + 3, 2,
                       ["OO","ER","EN","UY","ED","EM"])) {
              // 'schermerhorn', 'schenker' 
              if (string_at(original, current + 3, 2,
                         ["ER","EN"])) {
                primary   += "X";
                secondary += "SK";
              } else {
                primary   += "SK";
                secondary += "SK";
              }
              current += 3;
              break;
            } else {
              if ((current == 0) 
                  && !is_vowel(original, 3)
                  && (original.substr(current + 3, 1) != 'W')) {
                primary   += "X";
                secondary += "S";
              } else {
                primary   += "X";
                secondary += "X";
              }
              current += 3;
              break;
            }

            if (string_at(original, current + 2, 1,
                       ["I","E","Y"])) {
              primary   += "S";
              secondary += "S";
              current += 3;
              break;
            }

          // else
          primary   += "SK";
          secondary += "SK";
          current += 3;
          break;
        }

        // french e.g. 'resnais', 'artois'
        if ((current == last)
            && string_at(original, current - 2, 2,
                      ["AI","OI"])) {
          primary   += "";
          secondary += "S";
        } else {
          primary   += "S";
          secondary += "S";
        }

        if (string_at(original, current + 1, 1,
                   ["S","Z"]))
          current += 2;
        else 
          current += 1;
        break;

      case 'T':
        if (string_at(original, current, 4,
                   ["TION"])) {
          primary   += "X";
          secondary += "X";
          current += 3;
          break;
        }

        if (string_at(original, current, 3,
                   ["TIA","TCH"])) {
          primary   += "X";
          secondary += "X";
          current += 3;
          break;
        }

        if (string_at(original, current, 2,
                   ["TH"])
            || string_at(original, current, 3,
                          ["TTH"])) {
          // special case 'thomas', 'thames' or germanic
          if (string_at(original, current + 2, 2,
                     ["OM","AM"])
              || string_at(original, 0, 4, ["VAN ","VON "])
              || string_at(original, 0, 3, ["SCH"])) {
            primary   += "T";
            secondary += "T";
          } else {
            primary   += "0";
            secondary += "T";
          }
          current += 2;
          break;
        }

        if (string_at(original, current + 1, 1,
                   ["T","D"]))
          current += 2;
        else
          current += 1;
        primary   += "T";
        secondary += "T";
        break;

      case 'V':
        if (original.substr(current + 1, 1) == 'V')
          current += 2;
        else
          current += 1;
        primary   += "F";
        secondary += "F";
        break;

      case 'W':
        // can also be in middle of word
        if (string_at(original, current, 2, ["WR"])) {
          primary   += "R";
          secondary += "R";
          current += 2;
          break;
        }

        if ((current == 0)
            && (is_vowel(original, current + 1)
                || string_at(original, current, 2, 
                          ["WH"]))) {
          // Wasserman should match Vasserman 
          if (is_vowel(original, current + 1)) {
            primary   += "A";
            secondary += "F";
          } else {
            // need Uomo to match Womo 
            primary   += "A";
            secondary += "A";
          }
        }

        // Arnow should match Arnoff
        if (((current == last) 
              && is_vowel(original, current - 1))
            || string_at(original, current - 1, 5,
                      ["EWSKI","EWSKY","OWSKI","OWSKY"])
            || string_at(original, 0, 3, ["SCH"])) {
          primary   += "";
          secondary += "F";
          current += 1;
          break;
        }

        // polish e.g. 'filipowicz'
        if (string_at(original, current, 4,
                   ["WICZ","WITZ"])) {
          primary   += "TS";
          secondary += "FX";
          current += 4;
          break;
        }

        // else skip it
        current += 1;
        break;

      case 'X':
        // french e.g. breaux 
        if (!((current == last)
              && (string_at(original, current - 3, 3,
                         ["IAU", "EAU"])
               || string_at(original, current - 2, 2,
                         ["AU", "OU"])))) {
          primary   += "KS";
          secondary += "KS";
        }

        if (string_at(original, current + 1, 1,
                   ["C","X"]))
          current += 2;
        else
          current += 1;
        break;

      case 'Z':
        // chinese pinyin e.g. 'zhao' 
        if (original.substr(current + 1, 1) == "H") {
          primary   += "J";
          secondary += "J";
          current += 2;
          break;
        } else if (string_at(original, current + 1, 2,
                         ["ZO", "ZI", "ZA"])
                  || (Slavo_Germanic(original)
                      && ((current > 0)
                          && original.substr(current - 1, 1) != 'T'))) {
          primary   += "S";
          secondary += "TS";
        } else {
          primary   += "S";
          secondary += "S";
        }

        if (original.substr(current + 1, 1) == 'Z')
          current += 2;
        else
          current += 1;
        break;

      default:
        current += 1;

    } // end switch

  } // end while

  primary   = primary.substr(  0, 4);
  secondary = secondary.substr(0, 4);

  if( primary == secondary )
  {
    secondary = null ; 
  }

  return {
    primary: primary,
    secondary: secondary
  }
}

/*=================================================================*\
  # Name:   string_at(string, start, length, list)
  # Purpose:  Helper function for DoubleMetaphone( )
  # Return:   Bool
\*=================================================================*/
function string_at(string, start, length, list) 
{
    if ((start <0) || (start >= string.length))
      return 0;

    for (var i=0, len=list.length; i<len; i++) {
      if (list[i] == string.substr(start, length))
        return 1;
    }
    return 0;
  }


/*=================================================================*\
  # Name:   is_vowel(string, pos)
  # Purpose:  Helper function for DoubleMetaphone( )
  # Return:   Bool
\*=================================================================*/
function is_vowel(string, pos)
{
    return /[AEIOUY]/.test(string.substr(pos, 1));
}


/*=================================================================*\
  # Name:   Slavo_Germanic(string, pos)
  # Purpose:  Helper function for DoubleMetaphone( )
  # Return:   Bool
\*=================================================================*/
function Slavo_Germanic(string) 
{
		return /W|K|CZ|WITZ/.test(string);
}