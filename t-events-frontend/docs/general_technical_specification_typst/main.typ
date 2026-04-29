#import "../technical_specification_typst/template.typ": template
#import "../technical_specification_typst/cfg.typ": cfg
#import "data.typ": data

#show: body => template(cfg: cfg(data), body)

#include "body.typ"
