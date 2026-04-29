#import "../program_test_methodology_typst/template.typ": template
#import "cfg.typ": cfg
#import "data.typ": data

#show: body => template(cfg: cfg(data), body)

#include "body.typ"
